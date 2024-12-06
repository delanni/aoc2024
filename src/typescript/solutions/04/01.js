const fs = require('fs');

const input = fs.readFileSync('./input.txt').toString();

const rows = input.trim().split('\n').map((row) => row.trim());

// charArray[y][x]
const charArray = rows.map(row => row.split(''));

// relative coordinate mappings
const wordMappings = [
    [[0,0],[0, 1], [0, 2], [0,3]], // right
    [[0, 0], [0, -1], [0,-2], [0, -3]], // left
    [[0,0], [1, 0], [2, 0], [3, 0]], // down
    [[0,0], [-1, 0], [-2, 0], [-3, 0]], // up

    [[0,0], [1, 1], [2, 2], [3, 3]], // diag 1
    [[0,0], [-1, -1], [-2, -2], [-3, -3]], // diag 2
    [[0,0], [1, -1], [2, -2], [3, -3]], // diag 3
    [[0,0], [-1, 1], [-2, 2], [-3, 3]], // diag 4
]

const xCharCoordinates = [];
for (let y = 0; y < charArray.length; y++) {
    const row = charArray[y];
    for (let x = 0; x < row.length; x++) {
        if (charArray[y][x] === "X") {
            xCharCoordinates.push([y,x]);
        }
    }
}

const wordCandidates = xCharCoordinates.flatMap(([y,x]) => {
    const words = wordMappings.map(direction => {
        const word = direction.map(([offsetY, offsetX]) => {
            try {
                return charArray[y + offsetY][x + offsetX];
            } catch (_err) {
                return 'æ';
            } 
        }).join('');

        return word;
    });

    return words;
});

const xmasMatch = wordCandidates.filter((word)=> word === "XMAS").length;

console.log({
    xmasMatch
});
