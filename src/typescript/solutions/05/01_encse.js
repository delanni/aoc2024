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
function sortByRules(b,a) {
    if (rulesObj[`${b}|${a}`]) {
        return -1;
    } else {
        return 1;
    }
}

const correctUpdates = updates.filter((update) => {
    const updateArray = update.split('\n').map(Number);

    updateArray.sort(sortByRules);

    return updateArray.toString() === update;
})


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
