// Import setup first to ensure mocks are in place
import "./setup";

// Import dependencies
import { assertEquals, assertExists } from "https://deno.land/std@0.208.0/assert/mod.ts";
import { handler } from "../index.ts";
import { cleanup } from "./setup";

// Test cases
Deno.test("create-visuals - successful request", async () => {
  try {
    // Create request
    const request = new Request("http://localhost:54321/functions/v1/create-visuals", {
      method: "POST",
      headers: {
        "Authorization": "Bearer test-token",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ 
        section_id: "test-section-id",
        image_path: "test-image.png",
        context: "Test context"
      }),
    });

    // Execute handler
    const response = await handler(request);
    const responseData = await response.json();

    // Verify response
    assertEquals(response.status, 200);
    assertExists(responseData.data.document_id);
    assertExists(responseData.data.file_path);
    assertEquals(responseData.data.file_path.startsWith('visuals/test-section-id/'), true);
    assertEquals(responseData.data.file_path.endsWith('.png'), true);

  } finally {
    cleanup();
  }
});

Deno.test("create-visuals - missing authorization header", async () => {
  try {
    // Create request without auth header
    const request = new Request("http://localhost:54321/functions/v1/create-visuals", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ 
        section_id: "test-section-id",
        image_path: "test-image.png"
      }),
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

Deno.test("create-visuals - missing required parameters", async () => {
  try {
    // Create request without required parameters
    const request = new Request("http://localhost:54321/functions/v1/create-visuals", {
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
        message: "section_id and image_path are required"
      }
    });

  } finally {
    cleanup();
  }
});

Deno.test("create-visuals - section not found", async () => {
  try {
    // Create request with non-existent section_id
    const request = new Request("http://localhost:54321/functions/v1/create-visuals", {
      method: "POST",
      headers: {
        "Authorization": "Bearer test-token",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ 
        section_id: "non-existent-id",
        image_path: "test-image.png"
      }),
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

Deno.test("create-visuals - image not found", async () => {
  try {
    // Create request with non-existent image_path
    const request = new Request("http://localhost:54321/functions/v1/create-visuals", {
      method: "POST",
      headers: {
        "Authorization": "Bearer test-token",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ 
        section_id: "test-section-id",
        image_path: "non-existent-image.png"
      }),
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
        message: "Image not found"
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