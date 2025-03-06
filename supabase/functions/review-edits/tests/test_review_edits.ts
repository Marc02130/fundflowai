// Import setup first to ensure mocks are in place
import "./setup";

// Import dependencies
import { assertEquals, assertExists } from "https://deno.land/std@0.208.0/assert/mod.ts";
import { handler } from "../index.ts";
import { cleanup } from "./setup";

// Test cases
Deno.test("review-edits - successful request", async () => {
  try {
    // Create request
    const request = new Request("http://localhost:54321/functions/v1/review-edits", {
      method: "POST",
      headers: {
        "Authorization": "Bearer test-token",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ section_id: "test-section-id" }),
    });

    // Execute handler
    const response = await handler(request);
    const responseData = await response.json();

    // Verify response
    assertEquals(response.status, 200);
    assertExists(responseData.field_id);
    assertExists(responseData.ai_output);
    assertEquals(responseData.review_results.length, 3);
    
    // Verify review results
    const [spelling, logic, requirements] = responseData.review_results;
    assertEquals(spelling.type, 'spelling');
    assertEquals(logic.type, 'logic');
    assertEquals(requirements.type, 'requirements');
    assertExists(spelling.output);
    assertExists(logic.output);
    assertExists(requirements.output);

  } finally {
    cleanup();
  }
});

Deno.test("review-edits - missing authorization header", async () => {
  try {
    // Create request without auth header
    const request = new Request("http://localhost:54321/functions/v1/review-edits", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ section_id: "test-section-id" }),
    });

    // Execute handler
    const response = await handler(request);
    const responseData = await response.json();

    // Verify response
    assertEquals(response.status, 400);
    assertEquals(responseData, {
      success: false,
      error: {
        code: "auth/error",
        message: "Missing authorization header"
      }
    });

  } finally {
    cleanup();
  }
});

Deno.test("review-edits - missing section_id", async () => {
  try {
    // Create request without section_id
    const request = new Request("http://localhost:54321/functions/v1/review-edits", {
      method: "POST",
      headers: {
        "Authorization": "Bearer test-token",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    });

    // Execute handler
    const response = await handler(request);
    const responseData = await response.json();

    // Verify response
    assertEquals(response.status, 400);
    assertEquals(responseData, {
      success: false,
      error: {
        code: "input/invalid",
        message: "section_id is required"
      }
    });

  } finally {
    cleanup();
  }
});

Deno.test("review-edits - section not found", async () => {
  try {
    // Create request with non-existent section_id
    const request = new Request("http://localhost:54321/functions/v1/review-edits", {
      method: "POST",
      headers: {
        "Authorization": "Bearer test-token",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ section_id: "non-existent-id" }),
    });

    // Execute handler
    const response = await handler(request);
    const responseData = await response.json();

    // Verify response
    assertEquals(response.status, 404);
    assertEquals(responseData, {
      success: false,
      error: {
        code: "resource/not-found",
        message: "Section not found"
      }
    });

  } finally {
    cleanup();
  }
});

Deno.test("review-edits - no AI output found", async () => {
  try {
    // Create request with section but no AI output
    const request = new Request("http://localhost:54321/functions/v1/review-edits", {
      method: "POST",
      headers: {
        "Authorization": "Bearer test-token",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ section_id: "no-ai-output-id" }),
    });

    // Execute handler
    const response = await handler(request);
    const responseData = await response.json();

    // Verify response
    assertEquals(response.status, 404);
    assertEquals(responseData, {
      success: false,
      error: {
        code: "resource/not-found",
        message: "No AI output found for this section"
      }
    });

  } finally {
    cleanup();
  }
});

// Cleanup
Deno.test("cleanup", () => {
  cleanup();
}); 