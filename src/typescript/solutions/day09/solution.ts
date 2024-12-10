#!/usr/bin/env ts-node

import * as fs from 'fs';
import * as path from 'path';
import * as process from 'process';
import * as tools from '#/lib/tools';

const input = fs.readFileSync(path.join(__dirname, 'input.txt'), 'utf-8');

async function prepare() {
  const diskArray: Array<number | undefined> = [];
  let id = 0;
  const spaceIndices: number[] = [];
  const dataIndices: number[] = [];
  const spaceChunks: Array<{ n: number; startIdx: number; lastIdx: number }> = [];
  const dataChunks: Array<{ n: number; startIdx: number; lastIdx: number; id: number }> = [];

  input.split('').forEach((c, i) => {
    const n = Number(c);

    if (i % 2 === 0) {
      // id
      dataChunks.push({
        id: id,
        n,
        startIdx: diskArray.length,
        lastIdx: diskArray.length + n - 1,
      });
      tools.times(n, () => {
        const length = diskArray.push(id);
        dataIndices.push(length - 1);
      });
      id++;
    } else {
      // space
      spaceChunks.push({
        n,
        startIdx: diskArray.length,
        lastIdx: diskArray.length + n - 1,
      });
      tools.times(n, () => {
        const length = diskArray.push(undefined);
        spaceIndices.push(length - 1);
      });
    }
  });

  return {
    diskArray,
    dataIndices,
    spaceIndices,
    spaceChunks,
    dataChunks,
  };
}

async function solution1(data: Awaited<ReturnType<typeof prepare>>) {
  const { diskArray, spaceIndices, dataIndices } = data;

  console.log({
    emptySpaces: spaceIndices.length,
    dataIndices: dataIndices.length,
  });

  let spaceIdx = spaceIndices.shift();
  let dataIdx = dataIndices.pop();

  while (spaceIdx && dataIdx && spaceIdx < dataIdx) {
    diskArray[spaceIdx] = diskArray[dataIdx];
    delete diskArray[dataIdx];

    spaceIdx = spaceIndices.shift();
    dataIdx = dataIndices.pop();

    if (dataIndices.length % 50 === 0) {
      console.log('*', {
        emptySpaces: spaceIndices.length,
        dataIndices: dataIndices.length,
      });
    }
  }

  return diskArray.reduce((acc, id, idx) => {
    if (!id) {
      return acc as number;
    } else {
      return acc! + id * idx;
    }
  }, 0);
}

async function solution2(data: Awaited<ReturnType<typeof prepare>>) {
  const { diskArray, spaceChunks, dataChunks } = data;

  console.log({ fullLength: diskArray.length });

  let nextDataChunk = dataChunks.pop();

  while (nextDataChunk) {
    console.log(dataChunks.length + ' data chunks left');
    const nextFittingSpace = spaceChunks.find(({ n }) => n >= nextDataChunk!.n);

    if (!nextFittingSpace) {
      console.log(`Cannot fit data chunk: (${nextDataChunk.n} | ${nextDataChunk.id})`);
      nextDataChunk = dataChunks.pop();
      continue;
    }

    if (nextFittingSpace.startIdx >= nextDataChunk.startIdx) {
      console.log(`Won't move data chunk to the right: (${nextDataChunk.n} | ${nextDataChunk.id})`);
      nextDataChunk = dataChunks.pop();
      continue;
    }

    for (let i = 0; i < nextDataChunk.n; i++) {
      diskArray[nextFittingSpace.startIdx + i] = diskArray[nextDataChunk.startIdx + i];
      delete diskArray[nextDataChunk.startIdx + i];
    }

    console.log(`Moved (${nextDataChunk.n} | ${nextDataChunk.id}) to ${nextFittingSpace.startIdx}`);

    nextFittingSpace.n = nextFittingSpace.n - nextDataChunk.n;
    nextFittingSpace.startIdx += nextDataChunk.n;

    nextDataChunk = dataChunks.pop();
  }

  return diskArray.reduce((acc, id, idx) => {
    if (!id) {
      return acc as number;
    } else {
      return acc! + id * idx;
    }
  }, 0);
}

export default async function main(part: string) {
  const data = await tools.time(prepare, 'prepare');

  if (part === '1') {
    const result1 = await tools.time(() => solution1(data), 'solution1');
    console.log('Solution for 1: \n', result1);
  } else if (part === '2') {
    const result2 = await tools.time(() => solution2(data), 'solution2');
    console.log('Solution for 2: \n', result2);
  }
}

if (require.main === module) {
  main(process.argv[2])
    .then(() => {
      process.exit(0);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
