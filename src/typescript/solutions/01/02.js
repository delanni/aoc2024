const fs = require("fs");

// read input
const input = fs.readFileSync("./input.txt").toString();

const inputProcessed = input.split("\n").map((s) => s.trim().split(/\s+/));
const firstRow = inputProcessed.map((row) => row[0]);
const secondRow = inputProcessed.map((row) => row[1]);

// process
let similarityScore = 0;

for (let i = 0; i < firstRow.length; i++) {
    const firstNumber = firstRow[i];

    const count = secondRow.filter(n => n === firstNumber).length;

    similarityScore = similarityScore + (firstNumber * count);
}

// output solution
console.log({
    similarityScore,
});
