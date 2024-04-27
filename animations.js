import { wait } from "./helpers.js";

export const animations = {
  win: [[{}, { opacity: 0 }, {}], { duration: 300, iterations: 5 }],
  wrong: [
    [
      { transform: "rotate(-10deg)" },
      {
        transform: "rotate(5deg)",
      },
      {},
    ],
    {
      duration: 300,
      iterations: 1,
    },
  ],
  push: [
    [
      {},
      {
        opacity: 0.4,
        transform: "translateY(0.1rem)",
      },
      {},
    ],
    {
      duration: 300,
      iterations: 1,
    },
  ],
};

export function animateCell($cell, animation) {
  [...$cell.children].forEach(($child) => $child.animate(...animation));
}

export async function showFlashingMarkIntro({ $cellGrid, mark }) {
  // intro animation
  const animSpeed = 500;

  await wait(animSpeed);

  for (let $cell of $cellGrid.children) {
    $cell.classList.add(mark);
    // await wait(100);
  }

  await wait(animSpeed);

  for (let $cell of $cellGrid.children) {
    $cell.classList.remove(mark);
    // await wait(100);
  }

  await wait(animSpeed);
  // end
}
