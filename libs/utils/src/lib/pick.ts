/**
 * Pick a random element from an array
 */
export function pick<T>(data: Readonly<T[]>): T {
  const index = Math.floor(Math.random() * data.length);
  return data[index];
}
