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
const xPositions = JSON.parse(fs.readFileSync("./xPositions.json").toString());
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
    if (originalGameMap[y][x] === ".") {
      emptyBlocks.push({ y, x });
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
  const simulateStep = (i) => {
    const stepDirection = DIRECTIONS[character.direction];
    const stepMarker = {
      "^": "|",
      v: "|",
      "<": "-",
      ">": "-",
    }[character.direction];

    const targetY = character.y + stepDirection.y;
    const targetX = character.x + stepDirection.x;

    const targetBlock = gameMap[targetY]?.[targetX];

    if (i === 0) {
      gameMap[character.y][character.x] = stepMarker;
    }

    // console.log(`Direction: ${character.direction}; Target: ${targetBlock}`);

    if (targetBlock === ".") {
      character.y = targetY;
      character.x = targetX;
      gameMap[character.y][character.x] = stepMarker;
    } else if (
      (targetBlock === "-" && stepMarker === "|") ||
      (targetBlock === "|" && stepMarker === "-")
    ) {
      character.y = targetY;
      character.x = targetX;
      gameMap[character.y][character.x] = "+";
    } else if (targetBlock === "#") {
      character.direction = stepDirection.rightDir;
      gameMap[character.y][character.x] = "+";
    } else if (stepMarker === targetBlock || targetBlock === "+") {
      return true;
    } else if (typeof targetBlock === "undefined") {
      return false;
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

  if (result) {
    const gameMapTxt = gameMap.map((r) => r.join("")).join("\n");
    fs.writeFileSync("./outputs/results" + ix + ".txt", gameMapTxt);
  }
  return result;
});

// read target
console.log({
  count: loopInducingBlockerPositions.length,
});
