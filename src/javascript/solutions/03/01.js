const fs = require('fs');

// read input
const input = fs.readFileSync('./input.txt').toString();

// process: extract regexes: mul\([0-9]+,[0-9]+\)
const regex = /mul\([0-9]+,[0-9]+\)/g;
const matches = input.match(regex);  // [mul(3,56),mul(3,46),mul(33,56)]
// process: extract numbers and multiply
const multiplicationResult = matches.map(expression => {
    const mulExtractor = /[0-9]+/g
    const [first,second] = expression.match(mulExtractor) // mul(3,56) => [3,56]
    const result = Number(first) * Number(second);
    return result;
}) // => [4,6,74,3,5]
.reduce((a,b) => a+b, 0);

// ouptut
console.log({multiplicationResult})
