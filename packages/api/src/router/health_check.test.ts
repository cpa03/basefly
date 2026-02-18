import { describe, expect, it } from "vitest";
import { z } from "zod";

import { API_VALIDATION } from "@saasfly/common";

// Re-implement escapeHtml for testing (same logic as in health_check.ts)
function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Schema matching the hello router input
const helloInputSchema = z.object({
  text: z.string().max(API_VALIDATION.text.maxLength),
});

describe("Hello Router - Security Tests", () => {
  describe("escapeHtml - XSS Prevention", () => {
    it("escapes HTML tags", () => {
      const malicious = "<script>alert('xss')</script>";
      const escaped = escapeHtml(malicious);
      expect(escaped).toBe(
        "&lt;script&gt;alert(&#039;xss&#039;)&lt;/script&gt;",
      );
      expect(escaped).not.toContain("<script>");
    });

    it("escapes ampersands", () => {
      const input = "Tom & Jerry";
      const escaped = escapeHtml(input);
      expect(escaped).toBe("Tom &amp; Jerry");
    });

    it("escapes double quotes", () => {
      const input = 'He said "Hello"';
      const escaped = escapeHtml(input);
      expect(escaped).toBe("He said &quot;Hello&quot;");
    });

    it("escapes single quotes", () => {
      const input = "It's a test";
      const escaped = escapeHtml(input);
      expect(escaped).toBe("It&#039;s a test");
    });

    it("escapes all special characters together", () => {
      const input = `<div class="test" onclick='alert("XSS")'>Test & Demo</div>`;
      const escaped = escapeHtml(input);
      expect(escaped).toBe(
        "&lt;div class=&quot;test&quot; onclick=&#039;alert(&quot;XSS&quot;)&#039;&gt;Test &amp; Demo&lt;/div&gt;",
      );
    });

    it("does not modify safe strings", () => {
      const safe = "Hello World 123";
      const escaped = escapeHtml(safe);
      expect(escaped).toBe("Hello World 123");
    });

    it("handles empty string", () => {
      const escaped = escapeHtml("");
      expect(escaped).toBe("");
    });

    it("handles unicode characters", () => {
      const input = "Hello 世界 🌍";
      const escaped = escapeHtml(input);
      expect(escaped).toBe("Hello 世界 🌍");
    });

    it("handles newlines and tabs", () => {
      const input = "Line1\nLine2\tTabbed";
      const escaped = escapeHtml(input);
      expect(escaped).toBe("Line1\nLine2\tTabbed");
    });

    it("handles already escaped content", () => {
      const input = "&amp;&lt;&gt;";
      const escaped = escapeHtml(input);
      // Should escape the & again
      expect(escaped).toBe("&amp;amp;&amp;lt;&amp;gt;");
    });
  });

  describe("Input Validation", () => {
    it("accepts valid text input", () => {
      const result = helloInputSchema.safeParse({ text: "World" });
      expect(result.success).toBe(true);
    });

    it("accepts text at max length", () => {
      const maxText = "a".repeat(API_VALIDATION.text.maxLength);
      const result = helloInputSchema.safeParse({ text: maxText });
      expect(result.success).toBe(true);
    });

    it("accepts text with spaces", () => {
      const result = helloInputSchema.safeParse({ text: "Hello World" });
      expect(result.success).toBe(true);
    });

    it("accepts text with unicode characters", () => {
      const result = helloInputSchema.safeParse({ text: "你好世界" });
      expect(result.success).toBe(true);
    });

    it("accepts text with special characters", () => {
      const result = helloInputSchema.safeParse({
        text: "Test!@#$%^&*()_+-=[]{}|;:,./?",
      });
      expect(result.success).toBe(true);
    });

    it("rejects text exceeding max length", () => {
      const tooLong = "a".repeat(API_VALIDATION.text.maxLength + 1);
      const result = helloInputSchema.safeParse({ text: tooLong });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(
          result.error.issues.some((i) => i.message.includes("at most")),
        ).toBe(true);
      }
    });

    it("rejects non-string text", () => {
      const result = helloInputSchema.safeParse({ text: 123 });
      expect(result.success).toBe(false);
    });

    it("rejects null text", () => {
      const result = helloInputSchema.safeParse({ text: null });
      expect(result.success).toBe(false);
    });

    it("rejects missing text field", () => {
      const result = helloInputSchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it("rejects empty object", () => {
      const result = helloInputSchema.safeParse({});
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toHaveLength(1);
        expect(result.error.issues[0]?.path).toContain("text");
      }
    });
  });

  describe("Integration - Sanitized Output", () => {
    it("produces safe greeting from malicious input", () => {
      const maliciousInput = '<script>alert("xss")</script>';
      const sanitized = escapeHtml(maliciousInput.trim());
      const greeting = `hello ${sanitized}`;
      expect(greeting).toBe(
        "hello &lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;",
      );
      expect(greeting).not.toContain("<script>");
    });

    it("produces correct greeting for normal input", () => {
      const input = "World";
      const sanitized = escapeHtml(input.trim());
      const greeting = `hello ${sanitized}`;
      expect(greeting).toBe("hello World");
    });

    it("handles input with leading/trailing whitespace", () => {
      const input = "  Test  ";
      const sanitized = escapeHtml(input.trim());
      const greeting = `hello ${sanitized}`;
      expect(greeting).toBe("hello Test");
    });

    it("handles HTML entities in input", () => {
      const input = "Tom &amp; Jerry";
      const sanitized = escapeHtml(input.trim());
      const greeting = `hello ${sanitized}`;
      // The & in &amp; should be escaped
      expect(greeting).toBe("hello Tom &amp;amp; Jerry");
    });
  });
});
