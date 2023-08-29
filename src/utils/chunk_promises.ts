async function chunkPromises<T>(
  promises: (() => Promise<T>)[],
  concurrency: number,
): Promise<T[]> {
  const results: T[] = [];
  let index = 0;

  while (index < promises.length) {
    const chunk = promises.slice(index, index + concurrency);
    results.push(...(await Promise.all(chunk.map((p) => p()))));
    index += concurrency;
  }

  return results;
}

export { chunkPromises };
