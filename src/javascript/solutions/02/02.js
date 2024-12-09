const fs = require("fs");

// read input
const input = fs.readFileSync("./input.txt").toString();

/**
13 14 16 18 20 23 26
72 73 74 75 78
95 94 91 89 87 84 82
60 62 65 66 68
 */
const reports = input.split("\n").map((row) => row.split(/\s+/).map(Number));

const safeReports = reports.filter((report) => {
  const firstPassResult = validateReport(report);

  if (firstPassResult) {
    return true;
  }

  const alternatives = report.map((_el, idx, array) => {
    const arrayCpy = array.slice();
    arrayCpy.splice(idx, 1);
    return arrayCpy;
  });

  return alternatives.some((variation) => validateReport(variation));
});

function validateReport(report) {
  let ok = true;
  let sign = 0;

  for (let i = 0; i < report.length - 1; i++) {
    const diff = report[i + 1] - report[i];

    if (!sign) {
      sign = Math.sign(diff);
    } else {
      if (sign !== Math.sign(diff)) ok = false;
    }

    if (!(Math.abs(diff) >= 1 && Math.abs(diff) <= 3)) {
      ok = false;
    }
  }

  return ok;
}

// output
console.log({
  safeReportCount: safeReports.length,
});