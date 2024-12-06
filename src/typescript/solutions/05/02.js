// import fs
const fs = require("fs");

// import input
const inputRules = fs.readFileSync("./rules.txt").toString();
const inputUpdates = fs.readFileSync("./updates.txt").toString();

// process input
const rules = inputRules
  .trim()
  .split("\n")
  .map((row) => row.trim());

const rulesObj = {};
rules.forEach((numberPair) => {
  rulesObj[numberPair] = 1;
});

const updates = inputUpdates
  .trim()
  .split("\n")
  .map((row) => row.trim());

// calculate
const inCorrectUpdates = updates.filter((updateRow) => {
  const updateArray = updateRow.split(",").map((n) => Number(n));

  return !updateIsValid(updateArray);
});

const correctedUpdates = inCorrectUpdates.map((update) => {
  return correct(update);
});

console.log({ correctedUpdates });

const midSum = correctedUpdates
  .map((update) => {
    return update[Math.floor(update.length / 2)];
  })
  .reduce((a, b) => a + b, 0);

function correct(update) {
  const updateArray = update.split(",").map(Number);

  let sorted = [];

  while (updateArray.length) {
    const insertElem = updateArray.pop();

    for (let spliceIndex = 0; spliceIndex <= sorted.length; spliceIndex++) {
      const newArray = [
        ...sorted.slice(0, spliceIndex),
        insertElem,
        ...sorted.slice(spliceIndex),
      ];
      if (updateIsValid(newArray)) {
        sorted = newArray;
        break;
      }
    }
  }

  return sorted;
}

function updateIsValid(updateArray) {
  const forbiddenOrderings = [];
  for (let i = 0; i < updateArray.length - 1; i++) {
    for (let j = i + 1; j < updateArray.length; j++) {
      forbiddenOrderings.push(`${updateArray[j]}|${updateArray[i]}`);
    }
  }

  const updateIsValid = forbiddenOrderings.every(
    (forbiddenPair) => !rulesObj[forbiddenPair]
  );

  return updateIsValid;
}

// print output
console.log({
  midSum,
});
