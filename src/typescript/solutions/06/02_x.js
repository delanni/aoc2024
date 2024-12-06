const fs = require("fs");

const DIRECTIONS = {
  ">": { y: 0, x: 1, rightDir: "v" },
  "<": { y: 0, x: -1, rightDir: "^" },
  "^": { y: -1, x: 0, rightDir: ">" },
  v: { y: 1, x: 0, rightDir: "<" },
};
//['^', '>', 'v', '<'];

// read input
const input = fs.readFileSync("./input.txt").toString();
const emptyBlocks = [];

// process input (build map)
const rows = input
  .trim()
  .split("\n")
  .map((row) => row.trim());

// charArray[y][x]
const originalGameMap = rows.map((row) => row.split(""));
const originalCharacter = { y: 0, x: 0, direction: "^" };
for (let y = 0; y < originalGameMap.length; y++) {
  for (let x = 0; x < originalGameMap[y].length; x++) {
    if (originalGameMap[y][x] === "^") {
      originalCharacter.y = y;
      originalCharacter.x = x;
    }
    if (originalGameMap[y][x] === '.') {
      emptyBlocks.push({x,y});
    }
  }
}

function initializeGame() {
  return {
    gameMap: input
      .trim()
      .split("\n")
      .map((row) => row.trim())
      .map((row) => row.split("")),
    character: JSON.parse(JSON.stringify(originalCharacter)),
  };
}

// start simulation
const simulateGame = ({ gameMap, character }) => {
  const visitedBlocks = {};
  const simulateStep = () => {
    const stepDirection = DIRECTIONS[character.direction];
    visitedBlocks[`${character.direction}|${character.x},${character.y}`] = 1;

    const targetY = character.y + stepDirection.y;
    const targetX = character.x + stepDirection.x;

    const targetBlock = gameMap[targetY]?.[targetX];

    // console.log(`Direction: ${character.direction}; Target: ${targetBlock}`);

    if (targetBlock === "#") {
      character.direction = stepDirection.rightDir;
    } else if (typeof targetBlock === "undefined") {
      return false;
    } else {
      character.y = targetY;
      character.x = targetX;
      if (visitedBlocks[`${character.direction}|${character.x},${character.y}`]) {
        return true;
      }
    }

    return undefined;
  };

  let stepResult;
  let i = 0;
  do {
    stepResult = simulateStep(i++);
  } while (typeof stepResult === "undefined");

  return stepResult;
};

const loopInducingBlockerPositions = emptyBlocks.filter(({ x, y }, ix) => {
  const { gameMap, character } = initializeGame();
  if (character.x === x && character.y === y) {
    return true;
  }

  gameMap[y][x] = "#";

  console.log(`Starting simulation for ${x} ${y}`);
  const result = simulateGame({ gameMap, character });
  console.log(`Simulation for ${x} ${y} was a loop: '${result}'`);

  return result;
});

// read target
console.log({
  count: loopInducingBlockerPositions.length,
});
