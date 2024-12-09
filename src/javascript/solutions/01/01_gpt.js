const fs = require("fs");

// Function to calculate the total distance
function calculateTotalDistance(leftList, rightList) {
    // Sort both lists
    leftList.sort((a, b) => a - b);
    rightList.sort((a, b) => a - b);

    // Calculate the total distance
    let totalDistance = 0;
    for (let i = 0; i < leftList.length; i++) {
        totalDistance += Math.abs(leftList[i] - rightList[i]);
    }

    return totalDistance;
}

// Main function to read input, process, and output the result
function main() {
    try {
        // Read input from input.txt
        const input = fs.readFileSync("input.txt", "utf8");

        // Parse the input
        const leftList = [];
        const rightList = [];
        input
            .trim()
            .split("\n")
            .forEach(line => {
                const [left, right] = line.split(/\s+/).map(Number);
                leftList.push(left);
                rightList.push(right);
            });

        // Validate input
        if (leftList.length !== rightList.length) {
            console.error("Error: Both lists must have the same length.");
            return;
        }

        // Calculate and output the total distance
        const result = calculateTotalDistance(leftList, rightList);
        console.log(result);
    } catch (err) {
        console.error("Error reading or processing input:", err.message);
    }
}

// Run the main function
main();
