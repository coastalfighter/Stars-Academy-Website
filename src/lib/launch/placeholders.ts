/**
 * Text that must never reach a live page: template filler, unresolved
 * questions to the client and fictional contact details used in examples.
 * Case-sensitive on purpose: "TODO" is a marker, "todo" is Spanish for "all".
 */
export const PLACEHOLDER_PATTERNS: readonly { name: string; pattern: RegExp }[] = [
  { name: "unresolved client question", pattern: /\[?Client to confirm\]?/i },
  { name: "TODO marker", pattern: /\bTODO\b|\bTBD\b|\bFIXME\b/ },
  { name: "lorem ipsum", pattern: /lorem ipsum/i },
  { name: "example domain", pattern: /\bexample\.(com|org|net)\b/i },
  { name: "fictional 555 phone number", pattern: /\b555-01\d\d\b/ },
  { name: "replace-me value", pattern: /replace-me|REPLACE_ME|changeme/i },
];

export function findPlaceholders(text: string): string[] {
  return PLACEHOLDER_PATTERNS.filter(({ pattern }) => pattern.test(text)).map(({ name }) => name);
}
