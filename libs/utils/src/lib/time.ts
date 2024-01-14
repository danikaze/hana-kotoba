export async function time<T>(
  executor: () => T | Promise<T>,
  msg: string
): Promise<T> {
  const startTime = Date.now();
  const res = await executor();
  console.log(`${msg}: ${Date.now() - startTime} ms.`);
  return res;
}
