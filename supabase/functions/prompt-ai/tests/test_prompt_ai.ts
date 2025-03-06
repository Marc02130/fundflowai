// Import setup first to ensure mocks are in place
import "./setup";

// Import dependencies
import { assertEquals, assertExists } from "https://deno.land/std@0.168.0/testing/asserts.ts";
import { EdgeFunctionError, ERROR_CODES } from "../../shared/errors";
import { handler } from "../index";
import { cleanup } from "./setup";
import { validateUserSession, validateUserAccess } from "../../shared/auth";

// Mock data
const mockSection = {
  id: "test-section-id",
  grant_application_id: "test-application-id",
  grant_section_id: "test-grant-section-id",
  ai_generator_prompt: "Test section prompt",
  section_name: "Test Section",
  is_completed: false
};

const mockUserPrompt = {
  prompt_text: "Test custom prompt"
};

const mockAttachments = [
  { file_name: "test.pdf", file_type: "application/pdf", file_path: "test/path/test.pdf" }
];

const mockContext = {
  user_instructions: "Test instructions",
  user_comments_on_ai_output: "Test comments",
  ai_output: "Previous AI output"
};

// Test cases
Deno.test("prompt-ai - successful request with section prompt", async () => {
  const request = new Request("http://localhost:54321/functions/v1/prompt-ai", {
    method: "POST",
    headers: {
      "Authorization": "Bearer test-token",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      section_id: "test-section-id"
    })
  });

  const response = await handler(request);
  assertEquals(response.status, 200);
  const data = await response.json();
  assertExists(data.field_id);
  assertExists(data.ai_output);
});

Deno.test("prompt-ai - successful request with custom prompt", async () => {
  const request = new Request("http://localhost:54321/functions/v1/prompt-ai", {
    method: "POST",
    headers: {
      "Authorization": "Bearer test-token",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      section_id: "test-section-id",
      prompt_id: "test-prompt-id"
    })
  });

  const response = await handler(request);
  assertEquals(response.status, 200);
  const data = await response.json();
  assertExists(data.field_id);
  assertExists(data.ai_output);
});

Deno.test("prompt-ai - missing authorization header", async () => {
  const request = new Request("http://localhost:54321/functions/v1/prompt-ai", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      section_id: "test-section-id"
    })
  });

  const response = await handler(request);
  assertEquals(response.status, 400);
  const data = await response.json();
  assertEquals(data.error.code, "auth/error");
});

Deno.test("prompt-ai - missing section ID", async () => {
  const request = new Request("http://localhost:54321/functions/v1/prompt-ai", {
    method: "POST",
    headers: {
      "Authorization": "Bearer test-token",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({})
  });

  const response = await handler(request);
  assertEquals(response.status, 400);
  const data = await response.json();
  assertEquals(data.error.code, "input/invalid");
});

Deno.test("prompt-ai - section not found", async () => {
  const request = new Request("http://localhost:54321/functions/v1/prompt-ai", {
    method: "POST",
    headers: {
      "Authorization": "Bearer test-token",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      section_id: "non-existent-section"
    })
  });

  const response = await handler(request);
  assertEquals(response.status, 400);
  const data = await response.json();
  assertEquals(data.error.code, "resource/not-found");
});

// Cleanup
Deno.test("cleanup", () => {
  cleanup();
}); 