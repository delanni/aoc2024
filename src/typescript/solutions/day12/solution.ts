#!/usr/bin/env ts-node

import * as fs from 'fs';
import * as path from 'path';
import * as process from 'process';
import * as tools from '#/lib/tools';
import Matrix from '#/lib/matrix';

console.log = () => {};

const input = fs.readFileSync(path.join(__dirname, 'input.txt'), 'utf-8');

type GraphNode = {
  key: string;
  row: number;
  col: number;
  left: GraphNode | null;
  right: GraphNode | null;
  top: GraphNode | null;
  bottom: GraphNode | null;
  color: string;
};

async function prepare() {
  const matrix = new Matrix<GraphNode>().fromString(input, /./, (v, r, c) => ({
    key: `(${r},${c})`,
    row: r,
    col: c,
    top: null,
    left: null,
    right: null,
    bottom: null,
    color: v,
  }));

  const graph: { nodes: GraphNode[] } = {
    nodes: [],
  };

  matrix.forEach((r, c, graphNode) => {
    graph.nodes.push(graphNode);

    graphNode.top = matrix.get(r - 1, c) ?? null;
    graphNode.bottom = matrix.get(r + 1, c) ?? null;
    graphNode.left = matrix.get(r, c - 1) ?? null;
    graphNode.right = matrix.get(r, c + 1) ?? null;
  });

  const unchartedTerritory = graph.nodes.slice().reduce(tools.groupBy('key'), {});
  const blocks: Array<GraphNode[]> = [];

  while (Object.keys(unchartedTerritory).length) {
    const firstEl = unchartedTerritory[Object.keys(unchartedTerritory)[0]];
    delete unchartedTerritory[Object.keys(unchartedTerritory)[0]];

    const newBlock = [firstEl];
    let newNeighbours = [firstEl.bottom, firstEl.top, firstEl.left, firstEl.right];

    // while there are new elements
    while (newNeighbours.length) {
      const sameColorNeighbours = newNeighbours.filter((e) => e?.color === firstEl.color);
      newNeighbours = sameColorNeighbours.flatMap((node) => {
        if (!node) return [];

        if (unchartedTerritory[node.key]) {
          delete unchartedTerritory[node.key];

          // count to block
          newBlock.push(node);

          // filter for newNeighbours
          return [node.bottom, node.top, node.left, node.right];
        } else {
          return [];
        }
      });
    }

    blocks.push(newBlock);
  }

  return { blocks };
}

async function solution1(data: Awaited<ReturnType<typeof prepare>>) {
  return tools.sum(data.blocks.map(findCost));
}

async function solution2(data: Awaited<ReturnType<typeof prepare>>) {
  return tools.sum(data.blocks.map(findCost2));
}

function findCost(block: GraphNode[]): number {
  const blockColor = block[0].color;
  console.log(`Finding cost for ${blockColor} of ${block.length} elements.`);

  const perimeterBlocks = block.flatMap((node) =>
    [node.bottom, node.top, node.left, node.right].filter((e) => !(e?.color === blockColor)),
  );

  console.log(
    `Perimeter is: `,
    perimeterBlocks.map((e) => e?.key),
  );

  const perimeterNulls = perimeterBlocks.filter((n) => n === null).length;
  const perimeterNonnulls = perimeterBlocks.filter((n) => n !== null).map((e) => e.key);
  const perimeter = perimeterNonnulls.length + perimeterNulls;

  const area = block.length;

  return area * perimeter;
}

function findCost2(block: GraphNode[]): number {
  const blockObj = block.reduce(tools.groupBy('key'), {});
  const getSharedNeighbours = (nodeKey: string, cornerKey: string) => {
    const [nRow, nCol] = nodeKey.match(/[0-9-]+/g)!;
    const [cRow, cCol] = cornerKey.match(/[0-9-]+/g)!;
    console.log(
      `Shared neighbours for ${nodeKey},${cornerKey} =>`,
      `(${cRow},${nCol})`,
      `(${nRow},${cCol})`,
    );
    return [`(${cRow},${nCol})`, `(${nRow},${cCol})`];
  };
  const inBlock = (key: string) => !!blockObj[key];

  const potentialCornerPairings = block.flatMap((node) => {
    return [
      [node.key, `(${node.row + 1},${node.col + 1})`],
      [node.key, `(${node.row - 1},${node.col + 1})`],
      [node.key, `(${node.row + 1},${node.col - 1})`],
      [node.key, `(${node.row - 1},${node.col - 1})`],
    ];
  });

  console.log({ potentialCornerPairings });

  let corners = 0;
  potentialCornerPairings.forEach(([nodeKey, cornerKey]) => {
    console.log({ nodeKey, cornerKey });
    // pairing is a corner if:

    // -- both are in block, and their shared neighbours are both outside
    if (inBlock(nodeKey) && inBlock(cornerKey)) {
      const [n1, n2] = getSharedNeighbours(nodeKey, cornerKey);
      if (!inBlock(n1) && !inBlock(n2)) {
        console.log('A', { n1, n2 });
        console.log('both in block, neither neighbours in block +1');
        corners += 1;
      }
    }

    // if node is in, corner is out,
    //  and either no, or both shared neighbours are in
    if (inBlock(nodeKey) && !inBlock(cornerKey)) {
      const [n1, n2] = getSharedNeighbours(nodeKey, cornerKey);
      if (inBlock(n1) && inBlock(n2)) {
        console.log('B', { n1, n2 });
        console.log('node in block, both shared neighbours in block +1');
        corners += 1;
      } else if (!inBlock(n1) && !inBlock(n2)) {
        console.log('B', { n1, n2 });
        console.log('node in block, no shared neighbours in block +1');
        corners += 1;
      }
    }
  });

  const area = block.length;

  return area * corners;
}

export default async function main(part: string) {
  const data = await tools.time(prepare, 'prepare');

  if (part === '1') {
    const result1 = await tools.time(() => solution1(data), 'solution1');
    console.info('Solution for 1: \n', result1);
  } else if (part === '2') {
    const result2 = await tools.time(() => solution2(data), 'solution2');
    console.info('Solution for 2: \n', result2);
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
