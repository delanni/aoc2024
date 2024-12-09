const fs = require('fs');

// read input
const input = fs.readFileSync('./input.txt').toString();

const inputProcessed = input.split("\n").map(s => s.trim().split(/\s+/));
const firstRow = inputProcessed.map(row => row[0]);
const secondRow = inputProcessed.map(row => row[1]);

// process
firstRow.sort((a,b) => a-b);
secondRow.sort((a,b) => a-b);

const distances = [];
for (let i = 0; i < firstRow.length; i++) {
    const distance = Math.abs(firstRow[i] - secondRow[i]);
    distances.push(distance);
}

const totalDistance = distances.reduce((a,b) => a+b, 0);

// output solution
console.log({
    totalDistance
})