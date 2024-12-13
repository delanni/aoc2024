import childProcess from 'child_process';

export async function time<T>(fn: () => Promise<T>, name?: string): Promise<T> {
  const start = performance.now();
  name = name || fn.name;
  console.log(`⏱️ Timing ${name}`);
  const result = await fn();
  const end = performance.now();
  console.log(`⏱️ ${name} execution time: ${(end - start).toFixed(2)}ms`);
  return result;
}

export function readLines(input: string): string[] {
  return input.trim().split('\n');
}

export function readNumbers(input: string): number[] {
  return readLines(input).map(Number);
}

export function sum(numbers: number[]): number {
  return numbers.reduce((a, b) => a + b, 0);
}

export function product(numbers: number[]): number {
  return numbers.reduce((a, b) => a * b, 1);
}

export const getProjectRoot: () => string = (() => {
  let root: string | null = null;
  return () => {
    if (root === null) {
      root = childProcess.execSync('git rev-parse --show-toplevel').toString().trim();
    }
    return root;
  };
})();

export function times(n: number, fn: () => void) {
  while (n-- > 0) {
    fn();
  }
}

export function distinct<T>(array: T[]) {
  return array.filter((el, idx) => {
    return array.indexOf(el) === idx;
  });
}

export function groupBy<T, K extends { [key: string]: T }>(
  groupingKey: keyof T,
): (acc: K, el: T, idx: number) => K {
  return (acc: any, el: T, _idx: number) => {
    acc[el[groupingKey]] = el;
    return acc;
  };
}
