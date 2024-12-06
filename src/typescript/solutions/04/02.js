const fs = require("fs");

const input = fs.readFileSync("./input.txt").toString();

const rows = input
  .trim()
  .split("\n")
  .map((row) => row.trim());

// charArray[y][x]
const charArray = rows.map((row) => row.split(""));

// relative coordinate mappings
const wordMappings = [
  [
    [-1, -1],
    [0, 0],
    [1, 1],
  ], // diag 1
  [
    [1, -1],
    [0, 0],
    [-1, 1],
  ], // diag 2
];

const aCharCoordinates = [];
for (let y = 0; y < charArray.length; y++) {
  const row = charArray[y];
  for (let x = 0; x < row.length; x++) {
    if (charArray[y][x] === "A") {
      aCharCoordinates.push([y, x]);
    }
  }
}

const aMasMatches = aCharCoordinates.filter(([y, x]) => {
  const words = wordMappings.map((direction) => {
    const word = direction.map(([offsetY, offsetX]) => {
        try {
          return charArray[y + offsetY][x + offsetX];
        } catch (_err) {
          return "æ";
        }
      }).join("");

    return word;
  });

  if ((words[0] === "MAS" || words[0] === "SAM") && (words[1] === "MAS" || words[1] === "SAM")){
    return true;
  } else {
    return false;
  }
});

const aMasMatch = aMasMatches.length

console.log({
  aMasMatch
});
