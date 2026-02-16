/**
 * Normalizes backend errors into user-friendly messages.
 * Handles various error formats from the Internet Computer backend.
 */
export function normalizeBackendError(error: unknown): string {
  // If it's already an Error object with a message
  if (error instanceof Error) {
    return cleanErrorMessage(error.message);
  }

  // If it's a string
  if (typeof error === 'string') {
    return cleanErrorMessage(error);
  }

  // If it's an object with a message property
  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message: unknown }).message;
    if (typeof message === 'string') {
      return cleanErrorMessage(message);
    }
  }

  // Fallback for unknown error types
  return 'An unexpected error occurred. Please try again.';
}

/**
 * Cleans up error messages by removing duplicates, extra whitespace,
 * and common IC error prefixes.
 */
function cleanErrorMessage(message: string): string {
  // Remove IC error prefixes like "Call failed:" or "Reject text:"
  let cleaned = message
    .replace(/^(Call failed:|Reject text:|Error:)\s*/i, '')
    .trim();

  // Remove duplicate words (e.g., "two two" -> "two")
  cleaned = cleaned.replace(/\b(\w+)\s+\1\b/gi, '$1');

  // Fix common typos in error messages
  cleaned = cleaned
    .replace(/\bbedd\b/gi, 'bid')
    .replace(/\bplayers\b/gi, 'bidders'); // Context: "only 2 bidders can bid"

  // Ensure proper capitalization
  if (cleaned.length > 0) {
    cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }

  // Ensure it ends with proper punctuation
  if (cleaned.length > 0 && !/[.!?]$/.test(cleaned)) {
    cleaned += '.';
  }

  return cleaned;
}
