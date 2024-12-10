#!/usr/bin/env ts-node

import * as fs from 'fs';
import * as path from 'path';
import * as process from 'process';
import * as tools from '#/lib/tools';
import Vector from '@/typescript/lib/vector';
import Matrix from '@/typescript/lib/matrix';

const input = fs.readFileSync(path.join(__dirname, 'input.txt'), 'utf-8');

type GraphNode = {
  key: string;
  coords: Vector;
  value: number;
  neighbours: GraphNode[];
};

async function prepare() {
  const graph: {
    nodes: Array<GraphNode>;
  } = {
    nodes: [],
    // edges: []
  };

  const matrix = new Matrix<GraphNode>().fromString(input, /./, (char, r, c) => {
    return {
      key: `(${c},${r})`,
      coords: new Vector(c, r),
      neighbours: [],
      value: Number(char),
    };
  });

  matrix.forEach((r, c, node) => {
    const neighbours = [
      matrix.get(r + 1, c),
      matrix.get(r - 1, c),
      matrix.get(r, c + 1),
      matrix.get(r, c - 1),
    ].filter(Boolean) as GraphNode[];
    node.neighbours = neighbours;
    graph.nodes.push(node);
  });

  return {
    matrix,
    graph,
  };
}

function traverseByValue(startNode: GraphNode, useDistinct = false): number {
  let currentNodes = [startNode];
  let result = 0;

  for (let value = 1; value <= 9; value++) {
    const nextNodes = currentNodes.flatMap((n) =>
      n.neighbours.filter((neighbour) => neighbour.value === value),
    );
    currentNodes = useDistinct ? tools.distinct(nextNodes) : nextNodes;
    if (value === 9) {
      result = currentNodes.length;
    }
  }

  return result;
}

async function solution1(data: Awaited<ReturnType<typeof prepare>>) {
  const { graph } = data;
  const starters = graph.nodes.filter((n) => n.value === 0);
  return tools.sum(starters.map((node) => traverseByValue(node, true)));
}

async function solution2(data: Awaited<ReturnType<typeof prepare>>) {
  const { graph } = data;
  const starters = graph.nodes.filter((n) => n.value === 0);
  return tools.sum(starters.map((node) => traverseByValue(node, false)));
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
