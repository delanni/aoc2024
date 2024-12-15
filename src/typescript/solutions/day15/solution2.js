(async () => {
  const input = await (await fetch('./input.txt')).text();
  const inputLines = input.split('\n');
  const splitIndex = inputLines.findIndex((l) => l.trim() === '');
  const mapLines = inputLines.slice(0, splitIndex).map((row) => {
    return row
      .split('')
      .flatMap((c) => {
        if (c === '.') {
          return ['.', '.'];
        } else if (c === '#') {
          return ['#', '#'];
        } else if (c === 'O') {
          return ['[', ']'];
        } else if (c === '@') {
          return ['@', '.'];
        }
      })
      .join('');
  });
  const instructionLines = inputLines.slice(splitIndex);

  const charY = mapLines.findIndex((l) => l.includes('@'));
  const charX = mapLines[charY].match(/@/).index;
  let character = {
    location: new window.Vector(charX, charY),
  };
  const map = new window.Matrix().fromString(mapLines.join('\n'), /./);
  const instructions = instructionLines
    .join('\n')
    .split('')
    .filter((i) => i !== '\n');

  window.updateMap = () => {
    mapAsString = map._backingArray.map((e) => e.join('')).join('\n');

    document.getElementById('tree').innerHTML = mapAsString;

    return mapAsString;
  };

  window.updateMap();

  const directions = {
    '>': new Vector(1, 0),
    '<': new Vector(-1, 0),
    '^': new Vector(0, -1),
    v: new Vector(0, 1),
  };

  function canMove(startLoc, moveDir) {
    const newLoc = startLoc.add(moveDir);
    const targetBlock = map.get(newLoc.y, newLoc.x);
    if (targetBlock === '.') {
      return true;
    } else if (moveDir.x && (targetBlock === '[' || targetBlock === ']')) {
      if (canMove(newLoc, moveDir)) {
        return true;
      } else {
        return false;
      }
    } else if (moveDir.y && targetBlock === ']') {
      if (canMove(newLoc, moveDir) && canMove(newLoc.add(new Vector(-1, 0)), moveDir)) {
        return true;
      } else {
        return false;
      }
    } else if (moveDir.y && targetBlock === '[') {
      if (canMove(newLoc, moveDir) && canMove(newLoc.add(new Vector(1, 0)), moveDir)) {
        return true;
      } else {
        return false;
      }
    } else if (targetBlock === '#') {
      return false;
    }
  }

  function move(startLoc, moveDir) {
    const newLoc = startLoc.add(moveDir);
    const movingBlock = map.get(startLoc.y, startLoc.x);
    const targetBlock = map.get(newLoc.y, newLoc.x);

    let blockCouldMove = false;

    if (movingBlock === '.') return;

    if (targetBlock === '.') {
      map.set(startLoc.y, startLoc.x, '.');
      map.set(newLoc.y, newLoc.x, movingBlock);
      blockCouldMove = true;
    } else if (moveDir.x && (targetBlock === '[' || targetBlock === ']')) {
      if (canMove(newLoc, moveDir)) {
        move(newLoc, moveDir);
        move(startLoc, moveDir);
        return true;
      } else {
        return false;
      }
    } else if (moveDir.y && targetBlock === ']') {
      if (canMove(newLoc, moveDir) && canMove(newLoc.add(new Vector(-1, 0)), moveDir)) {
        move(newLoc, moveDir);
        move(startLoc, moveDir);
        blockCouldMove = true;
      } else {
        blockCouldMove = false;
      }
    } else if (moveDir.y && targetBlock === '[') {
      if (canMove(newLoc, moveDir) && canMove(newLoc.add(new Vector(1, 0)), moveDir)) {
        move(newLoc, moveDir);
        move(startLoc, moveDir);
        blockCouldMove = true;
      } else {
        blockCouldMove = false;
      }
    } else if (targetBlock === '#') {
      return false;
    }

    // Move the other part with the first
    if (blockCouldMove && moveDir.y) {
      if (movingBlock === '[')
        move(startLoc.add(new Vector(1,0)), moveDir);
      if (movingBlock === ']')
        move(startLoc.add(new Vector(-1,0)), moveDir);
    }

    return blockCouldMove;
  }

  window.simulateOneStep = () => {
    const instruction = instructions.shift();
    const directionVector = directions[instruction];

    const couldMove = move(character.location, directionVector);
    if (couldMove) {
      character.location = character.location.add(directionVector);
    }
  };

  window.step = () => {
    console.time('sim');
    window.simulateOneStep();
    console.timeEnd('sim');

    console.time('draw');
    window.updateMap();
    console.timeEnd('draw');
  };

  window.stepUntil = (slowSim) => {
    console.time('simUntil');
    if (slowSim) {
      window.step();
      requestAnimationFrame(() => window.stepUntil(true));
    } else {
      while (instructions.length) {
        window.step();
      }
    }

    if (!instructions.length) {
      console.log(getMapScore(map));
    }

    console.timeEnd('simUntil');
  };

  const getMapScore = (map) => {
    let score = 0;
    map.forEach((r, c, v) => {
      score += v === '[' ? r * 100 + c : 0;
    });

    return score;
  };

  window.onkeypress = (evt) => {
    const dir = {
      w: '^',
      a: '<',
      s: 'v',
      d: '>',
    }[evt.key];
    instructions.unshift(dir);

    window.step();
  };
})();
