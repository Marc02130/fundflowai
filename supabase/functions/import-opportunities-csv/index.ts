import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { parse as parseCSV } from "https://deno.land/std@0.168.0/encoding/csv.ts";

interface GrantOpportunity {
  announcement_number: string;
  title: string;
  release_date: string;
  open_date: string;
  expiration_date: string;
  url: string;
  grant_id: string;
  created_at?: string;
  updated_at?: string;
}

serve(async (req) => {
  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Only allow POST requests
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Parse the request body
    const formData = await req.formData();
    const csvFile = formData.get("file");
    const grantId = formData.get("grantId") as string;

    // Validate inputs
    if (!csvFile || !(csvFile instanceof File)) {
      return new Response(JSON.stringify({ error: "CSV file is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    if (!grantId) {
      return new Response(JSON.stringify({ error: "Grant ID is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Read and parse the CSV file
    const csvText = await csvFile.text();
    const parsedData = await parseCSV(csvText, { 
      skipFirstRow: true,
      columns: true
    });

    // Transform CSV data to match our database schema
    const now = new Date().toISOString();
    const opportunities: GrantOpportunity[] = [];
    const seenAnnouncementNumbers = new Set<string>();

    for (const row of parsedData) {
      // Extract the announcement number (assuming it's a required field)
      const announcementNumber = row["Announcement Number"] || 
                                row["NSF/PD Num"] || 
                                row["FOA Number"] || 
                                row["ID"];

      if (!announcementNumber || seenAnnouncementNumbers.has(announcementNumber)) {
        continue; // Skip duplicates or rows without announcement numbers
      }

      seenAnnouncementNumbers.add(announcementNumber);

      // Handle dates (with fallbacks)
      const releaseDate = parseDate(row["Release Date"] || row["Posted date"] || row["Posted date (Y-m-d)"]);
      if (!releaseDate) {
        continue; // Skip if we can't determine a release date
      }

      const openDate = parseDate(row["Open Date"] || row["Start date"] || releaseDate);
      
      // Handle expiration date with special case for "accepted anytime"
      let expirationDate: string;
      if (
        row["Proposals accepted anytime"]?.toLowerCase() === "yes" ||
        row["Expiration Date"]?.toLowerCase().includes("until") ||
        row["Expiration Date"]?.toLowerCase().includes("continuous")
      ) {
        expirationDate = "2099-12-31"; // Far future date for continuous submissions
      } else {
        expirationDate = parseDate(
          row["Expiration Date"] || 
          row["Close Date"] || 
          row["Next due date"] || 
          row["Next due date (Y-m-d)"]
        );
        
        // If no expiration date provided, default to one year after release
        if (!expirationDate && releaseDate) {
          const [year, month, day] = releaseDate.split("-");
          expirationDate = `${parseInt(year) + 1}-${month}-${day}`;
        }
      }

      // Get the opportunity URL
      const url = row["URL"] || row["Solicitation URL"] || row["Link"] || "";

      // Add to opportunities array
      opportunities.push({
        announcement_number: announcementNumber,
        title: row["Title"] || row["Name"] || "",
        release_date: releaseDate,
        open_date: openDate || releaseDate,
        expiration_date: expirationDate,
        url: url,
        grant_id: grantId,
        created_at: now,
        updated_at: now
      });
    }

    // Insert the opportunities into the database
    const { data, error } = await supabaseClient
      .from("grant_opportunities")
      .upsert(opportunities, { 
        onConflict: "announcement_number",
        ignoreDuplicates: false
      });

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully imported ${opportunities.length} grant opportunities`,
        imported: opportunities.length
      }),
      { headers: { "Content-Type": "application/json" } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      { 
        status: 500, 
        headers: { "Content-Type": "application/json" } 
      }
    );
  }
});

// Helper function to parse and validate dates
function parseDate(dateStr?: string): string | null {
  if (!dateStr) {
    return null;
  }
  
  // For multiple dates separated by commas, use the first one
  if (dateStr.includes(",")) {
    dateStr = dateStr.split(",")[0].trim();
  }
  
  try {
    // Try different date formats
    let date: Date;
    
    // Check if it's already in YYYY-MM-DD format
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      date = new Date(dateStr);
    } 
    // Check MM/DD/YYYY format
    else if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateStr)) {
      const [month, day, year] = dateStr.split("/");
      date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }
    // Check MM-DD-YYYY format
    else if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(dateStr)) {
      const [month, day, year] = dateStr.split("-");
      date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }
    // If none of the formats match, try generic Date parsing
    else {
      date = new Date(dateStr);
    }
    
    // Validate the date is valid
    if (isNaN(date.getTime())) {
      return null;
    }
    
    // Format as YYYY-MM-DD for database
    return date.toISOString().split("T")[0];
  } catch {
    return null;
  }
} 