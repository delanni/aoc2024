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
