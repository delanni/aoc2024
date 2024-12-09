const fs = require("fs");

const file = fs.readFileSync("./input.txt").toString();

// process input into a 2d array
const yx2dArray = file
  .trim()
  .split("\n")
  .map((row) => row.trim().split(""));

// generate coordinate expansion for the 8 match cases
const sampleDirections = [
    [[0,0],[0,1],[0,2],[0,3]], // horizontal normal
    [[0,0],[0,-1],[0,-2],[0,-3]], // horizontal rtl
    [[0,0],[1,0],[2,0],[3,0]], // vertical
    [[0,0],[-1,0],[-2,0],[-3,0]], // vertical up
    [[0,0],[1, 1],[2, 2],[3, 3]], // diagonal 1
    [[0,0],[-1, -1],[-2, -2],[-3, -3]], // diagonal 2
    [[0,0],[1, -1],[2, -2],[3, -3]], // diagonal 3
    [[0,0],[-1, 1],[-2, 2],[-3, 3]], // diagonal 4
]

// find all X-es, extract potential matches, count them
const coordsOfXes = [];

for (let y = 0; y < yx2dArray.length; y++) {
    const row = yx2dArray[y];
    for (let x = 0; x < row.length; x++) {
        if (row[x] === "X") {
            coordsOfXes.push([y,x]);
        }
    }
}

// expand from X-es:
const potentialMatches = coordsOfXes.flatMap(([y,x]) => {
    return sampleDirections.map(sampleCoords => {
        return readFromYXArray(yx2dArray, sampleCoords, [y,x]);
    });
});

const xmasMatches = potentialMatches.filter(word => word === "XMAS");

console.log({
    potentialMatches: potentialMatches.slice(0,10),
    xmasMatches: xmasMatches.length
});

function readFromYXArray(yx2dArray, coords, offset = [0,0]) {
    const placeholder = '•';
    return coords.map(([y,x]) => {
        try {
            return yx2dArray[offset[0] + y][offset[1] + x] || placeholder;
        } catch (_err) {
            return placeholder;
        }
    }).join('');
}