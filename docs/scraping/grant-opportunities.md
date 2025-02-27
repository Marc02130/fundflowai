NIH

source: https://grants.nih.gov/funding/nih-guide-for-grants-and-contracts/parent-announcements
table: grant_opportunities (fk on grants)

NSF

source: https://www.nsf.gov/funding/opportunities
csv: https://www.nsf.gov/funding/opps/csvexport?page&_format=csv

NSF program is a grant opportunity - each program can apply to multiple grants and usually does.

## NSF Grant Opportunities Importer

```python
import csv
import requests
from datetime import datetime
import uuid
import os

def fetch_nsf_grants():
    # URL for NSF grants CSV
    url = "https://www.nsf.gov/funding/opps/csvexport?exposed_form_display=1&f%5B0%5D=exclude_dcls%3A1&page&_format=csv"
    
    # Add browser-like headers to avoid 403 Forbidden error
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    
    # Fetch the CSV data with proper headers
    response = requests.get(url, headers=headers)
    response.raise_for_status()  # Raise an exception for HTTP errors
    
    # Parse the CSV
    csv_data = response.text
    reader = csv.DictReader(csv_data.splitlines())
    
    # Convert to list for sorting
    rows = list(reader)
    
    # Sort by NSF/PD Num and Program ID
    rows.sort(key=lambda x: (x.get('NSF/PD Num', ''), x.get('Program ID', '')))
    
    # Grant ID to link to (fixed for this example)
    grant_id = "931d90c8-9577-4467-b323-64312e459b6f"
    
    # Generate SQL INSERT statements
    insert_statements = "INSERT INTO public.grant_opportunities (announcement_number, title, release_date, open_date, expiration_date, url, created_at, updated_at, grant_id) VALUES "
    
    count = 0
    # Track which NSF/PD Nums we've already seen
    seen_announcement_numbers = set()
    
    for row in rows:
        # Skip "Dear colleague letter" type entries
        if row.get('Type', '').lower() == "dear colleague letter":
            continue
        
        # Extract announcement number
        announcement_number = row.get('NSF/PD Num', '')
        if not announcement_number:
            continue
            
        # Skip if we've already seen this announcement number
        if announcement_number in seen_announcement_numbers:
            continue
            
        # Add to set of seen announcement numbers
        seen_announcement_numbers.add(announcement_number)
        
        # Extract and format data
        title = row.get('Title', '').replace("'", "''")  # Escape single quotes
        release_date = parse_date(row.get('Posted date (Y-m-d)', ''))
        if not release_date:
            continue
            
        open_date = release_date  # Using posted date as open date
        
        # Get URL from the CSV - use primary URL field, fallback to solicitation URL
        opportunity_url = row.get('URL', '')
        if not opportunity_url:
            opportunity_url = row.get('Solicitation URL', '')
        # Escape single quotes in URL
        opportunity_url = opportunity_url.replace("'", "''")
        
        # Handle expiration date
        if row.get('Proposals accepted anytime', '').lower() == 'yes':
            # Set a far future date if proposals accepted anytime
            expiration_date = "2099-12-31"
        else:
            # Use the next due date as expiration
            expiration_date = parse_date(row.get('Next due date (Y-m-d)', ''))
            # If no valid date, default to one year from release
            if not expiration_date:
                if release_date:
                    year = int(release_date.split('-')[0]) + 1
                    expiration_date = f"{year}-{release_date.split('-')[1]}-{release_date.split('-')[2]}"
                else:
                    continue  # Skip if no valid dates
        
        # Create the SQL INSERT statement
        insert_statements += f"('{announcement_number}', '{title}', '{release_date}', '{open_date}', '{expiration_date}', '{opportunity_url}', now(), now(), '{grant_id}'),"
        count += 1
    
    # Complete the SQL statement with a semicolon
    return insert_statements[:-1] + ";", count

def parse_date(date_str):
    """Parse and validate a date string in Y-m-d format"""
    if not date_str:
        return None
    
    try:
        # For multiple dates separated by commas, use the first one
        if ',' in date_str:
            date_str = date_str.split(',')[0].strip()
            
        # Validate the format
        datetime.strptime(date_str, '%Y-%m-%d')
        return date_str
    except ValueError:
        return None

def write_sql_to_file(sql_statement, filename="nsf-programs.sql"):
    """Write the SQL statement to a file"""
    with open(filename, 'w') as f:
        f.write("-- NSF Grant Opportunities Import\n")
        f.write(f"-- Generated on {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
        f.write(sql_statement)
    
    print(f"SQL file saved as {filename}")
    return os.path.abspath(filename)

def run():
    """Run the NSF grant opportunities import process"""
    print("Fetching NSF grant opportunities...")
    sql_statement, count = fetch_nsf_grants()
    print(f"Found {count} grant opportunities")
    
    file_path = write_sql_to_file(sql_statement)
    print(f"SQL file written to {file_path}")
    
    print("\nTo execute the SQL, you can run:")
    print(f"psql -U your_username -d your_database -f {file_path}")
    
    return file_path

if __name__ == "__main__":
    run()
```

Usage:
1. Run the script to generate the SQL file: `python nsf_grant_importer.py`
2. The SQL will be saved to "nsf-programs.sql"
3. Execute the SQL file against your database with psql or your database management tool
4. The script automatically filters out "Dear colleague letter" type entries and only imports the first instance of each NSF/PD number

You can also import and call the run function from another script:
```python
from nsf_grant_importer import run
sql_file_path = run()
print(f"Generated SQL at {sql_file_path}")
```

