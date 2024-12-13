export function generateAllVariations<T>(inputs: T[], length: number): Array<T[]> {
  if (length === 0) {
    return [];
  } else if (length === 1) {
    return inputs.map((inputOption) => [inputOption]);
  } else {
    const restVariations = generateAllVariations(inputs, length - 1);
    return inputs.flatMap((inputOption) => {
      return restVariations.map((restVariation) => {
        return [inputOption, ...restVariation];
      });
    });
  }
}

export function generateAllPairings<T>(inputSet: T[]): Array<[T, T]> {
  const output: [T, T][] = [];
  for (let i = 0; i < inputSet.length - 1; i++) {
    for (let j = i + 1; j < inputSet.length; j++) {
      output.push([inputSet[i], inputSet[j]]);
    }
  }
  return output;
}

export function greatestCommonDivisor(n1: number, n2: number) {
  if (n1 === n2) {
    return n1;
  } else {
    const bigger = Math.max(n1, n2);
    const smaller = Math.min(n1, n2);
    const fitsTimes = Math.floor(bigger / smaller);
    if (bigger - fitsTimes * smaller === 0) {
      return smaller;
    }
    return greatestCommonDivisor(bigger - fitsTimes * smaller, smaller);
  }
}
