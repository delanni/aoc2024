const fs = require("fs");

// read input
const input = fs.readFileSync("./input.txt").toString();

// process: extract regexes: mul\([0-9]+,[0-9]+\)
const regex = /(mul\([0-9]+,[0-9]+\)|do\(\)|don't\(\))/g;
const matches = input.match(regex); // mul(4,6) | do() | don't()

// process: extract numbers and multiply
let multiplicationResult = 0;
let shouldAdd = true;
for (let i = 0; i < matches.length; i++) {
  const expression = matches[i];
  if (expression === "do()") {
    shouldAdd = true;
  } else if (expression === "don't()") {
    shouldAdd = false;
  } else {
    if (shouldAdd) {
      const mulExtractor = /[0-9]+/g;
      const [first, second] = expression.match(mulExtractor); // mul(3,56) => [3,56]
      const result = Number(first) * Number(second);
      multiplicationResult += result;
    }
  }
}

// output
console.log({ multiplicationResult });
