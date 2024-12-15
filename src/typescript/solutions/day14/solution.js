class Vector {
  $tag = 'VECTOR';
  x;
  y;

  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  add(xOrVector, y = 0) {
    if (xOrVector instanceof Vector) {
      return new Vector(this.x + xOrVector.x, this.y + xOrVector.y);
    } else {
      return new Vector(this.x + xOrVector, this.y + y);
    }
  }

  sub(xOrVector, y = 0) {
    if (xOrVector instanceof Vector) {
      return new Vector(this.x - xOrVector.x, this.y - xOrVector.y);
    } else {
      return new Vector(this.x - xOrVector, this.y - y);
    }
  }

  scale(s) {
    return new Vector(this.x * s, this.y * s);
  }

  clip() {
    return new Vector(Math.round(this.x), Math.round(this.y));
  }

  clone() {
    return new Vector(this.x, this.y);
  }

  magnitude() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  normalize() {
    const mag = this.magnitude();
    return new Vector(this.x / mag, this.y / mag);
  }

  toString() {
    return `(${this.x}, ${this.y})`;
  }
}

const MAP_WIDTH = 101;
const MAP_HEIGHT = 103;

(async () => {
  const input = await (await fetch('./input.txt')).text();
  const robots = input
    .trim()
    .split('\n')
    .map((line) => {
      const match = line.trim().match(/([0-9-]+)/g);
      if (match) {
        return {
          startPos: new Vector(Number(match[0]), Number(match[1])),
          currentPos: new Vector(Number(match[0]), Number(match[1])),
          velocity: new Vector(Number(match[2]), Number(match[3])),
        };
      } else {
        throw new Error('Malformed input line: ' + line);
      }
    });

  console.log({ robots });

  function getDrawing(robots) {
    const drawing = new Array(103).fill(0).map(() => new Array(101).fill('.'));

    robots.forEach((robot) => {
      drawing[robot.currentPos.y][robot.currentPos.x] = '*';
    });

    return drawing;
  }

  window.updateMap = (drawing) => {
    drawing = drawing || getDrawing(robots);

    document.getElementById('tree').innerHTML = drawing.map((row) => row.join('')).join('\n');

    return drawing;
  };

  window.updateMap();

  let i = 0;
  window.step = () => {
    i++;
    console.time('sim');
    robots.forEach((r) => {
      r.currentPos = r.currentPos.add(r.velocity);
      r.currentPos.x = r.currentPos.x % MAP_WIDTH;
      if (r.currentPos.x < 0) {
        r.currentPos.x += MAP_WIDTH;
      }
      r.currentPos.y = r.currentPos.y % MAP_HEIGHT;
      if (r.currentPos.y < 0) {
        r.currentPos.y += MAP_HEIGHT;
      }
    });
    console.timeEnd('sim');

    console.time('draw');
    window.updateMap();
    console.timeEnd('draw');

    console.log('Drawing after ' + i + 'seconds');
  };

  let maxCohesionIndex = -Infinity;
  let snapshot = null;
  window.stepUntil = () => {
    console.time('simUntil');

    let matchFound = false;
    while (!matchFound) {
      i++;
      robots.forEach((r) => {
        r.currentPos = r.currentPos.add(r.velocity);
        r.currentPos.x = r.currentPos.x % MAP_WIDTH;
        if (r.currentPos.x < 0) {
          r.currentPos.x += MAP_WIDTH;
        }
        r.currentPos.y = r.currentPos.y % MAP_HEIGHT;
        if (r.currentPos.y < 0) {
          r.currentPos.y += MAP_HEIGHT;
        }
      });

      //   const centerIsAllRobots = sampleMapCenter(5, 5, robots);
      //   matchFound = centerIsAllRobots;

      if (i % 10000 === 0) {
        console.log('i is at' + i + ' seconds');
      }

      const drawing = getDrawing(robots);
      const cohesionIndex = calculateCohesionIndex(drawing);
      if (cohesionIndex > maxCohesionIndex) {
        maxCohesionIndex = cohesionIndex;
        window.updateMap(drawing);
        snapshot = {
          drawing,
          i,
          maxCohesionIndex,
        };
        console.log('Updated', snapshot);
        document.getElementById('snapshot').innerHTML = JSON.stringify(
          { i, maxCohesionIndex },
          null,
          2,
        );
        matchFound = true;
      }
    }
    console.timeEnd('simUntil');

    console.log('Match found after' + i + ' seconds');

    console.time('draw');
    window.updateMap();
    console.timeEnd('draw');

    console.log('Drawing after ' + i + 'seconds');

    setTimeout(() => {
      window.stepUntil();
    }, 50);
  };
})();

// cohesion is high, if we switch between * and . few times
function calculateCohesionIndex(drawing) {
  let switches = 0;
  drawing.forEach((row) =>
    row.forEach((e, i, a) => {
      if (a[i - 1] !== e) {
        switches++;
      }
    }),
  );

  return 1 / switches;
}

function sampleMapCenter(m, n, robots) {
  const drawing = new Array(103).fill(0).map(() => new Array(101).fill('.'));

  robots.forEach((robot) => {
    drawing[robot.currentPos.y][robot.currentPos.x] = '*';
  });

  const sample = drawing
    .slice(Math.floor(MAP_HEIGHT / 2 - m / 2), Math.floor(MAP_HEIGHT / 2 - m / 2) + m)
    .map((row) => {
      return row
        .slice(Math.floor(MAP_WIDTH / 2 - n / 2), Math.floor(MAP_WIDTH / 2 - n / 2) + n)
        .join('');
    })
    .join('');

  return sample.split('').filter((e) => e === '*').length >= n * m * 0.75;
}
