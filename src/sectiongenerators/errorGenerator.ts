// src/utils/generateError.ts

/**
 * Generates a random error value.
 * @returns A random number between -0.1 and 0.1.
 */
export function generateError(): number {
  return (Math.random() - 0.5) * 0.2;
}
