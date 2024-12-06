const fs = require("fs");

const file = fs.readFileSync("./input.txt").toString();

// process input into a 2d array
const yx2dArray = file
  .trim()
  .split("\n")
  .map((row) => row.trim().split(""));

// generate coordinate expansion for the 8 match cases
const sampleDirections = [
    [[-1,-1],[0,0],[1,1]],
    [[1,-1],[0,0],[-1, 1]]
]

// find all A-es, extract potential matches, count them
const coordsOfAs = [];

for (let y = 0; y < yx2dArray.length; y++) {
    const row = yx2dArray[y];
    for (let x = 0; x < row.length; x++) {
        if (row[x] === "A") {
            coordsOfAs.push([y,x]);
        }
    }
}

// expand from A-es:
const matches = coordsOfAs.filter(([y,x]) => {
    const [w1, w2] = sampleDirections.map(sampleCoords => {
        return readFromYXArray(yx2dArray, sampleCoords, [y,x]);
    });

    return (w1 === "MAS" || w1 === "SAM") && (w2 === "MAS" || w2 === "SAM")
});

console.log({
    matches: matches.length
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