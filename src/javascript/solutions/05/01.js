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
const correctUpdates = updates.filter((updateRow) => {
  const updateArray = updateRow.split(",").map((n) => Number(n));

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
});

const midSum = correctUpdates
  .map((update) => {
    const updateArray = update.split(",").map((n) => Number(n));
    return updateArray[Math.floor(updateArray.length / 2)];
  })
  .reduce((acc, n) => {
    return acc + n;
  }, 0);

// print output
console.log({
  midSum,
});
