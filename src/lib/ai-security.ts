/**
 * Sanitizes input text before sending to LLM prompts, mitigating prompt injections and system leakage commands.
 */
export function sanitizePromptInput(text: string): string {
  if (!text) return "";
  
  // 1. Remove dangerous formatting to keep structure simple
  let sanitized = text.replace(/[\r\n\t]/g, " ");
  
  // 2. Reject common jailbreak / command injection strings
  const forbiddenPhrases = [
    "ignore previous instructions",
    "ignore above instructions",
    "system prompt leakage",
    "reveal your prompt",
    "output the system prompt",
    "you are now an assistant",
    "override system directives",
    "forget what you did",
    "execute javascript",
    "<script>",
    "javascript:"
  ];

  const lowerText = sanitized.toLowerCase();
  for (const phrase of forbiddenPhrases) {
    if (lowerText.includes(phrase)) {
      throw new Error(`Security Exception: Input contains blocked injection keyword: "${phrase}"`);
    }
  }

  // 3. Limit characters to prevent token exhaustion overflow attacks
  if (sanitized.length > 8000) {
    sanitized = sanitized.substring(0, 8000);
  }

  return sanitized;
}

/**
 * Validates extracted JSON structure from LLMs to ensure schema alignment
 */
export function validateLLMJsonOutput(data: any, requiredKeys: string[]): boolean {
  if (!data || typeof data !== "object") return false;
  return requiredKeys.every(key => key in data);
}
