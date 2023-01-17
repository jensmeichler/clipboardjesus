/**
 * The current index of created ids.
 * This is necessary, because sometimes ids are created at the same time,
 * so we have to add a counter to them.
 */
let i = 0;

/**
 * Generates the next unique id.
 */
export function sessionIdAutoIncrement(): string {
  return new Date().toISOString() + i++;
}
