// helpers
export function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// -----------

const cellCount = 9;
const maxMoves = 3;

const markCross = "mark-x";
const markZero = "mark-0";
const markOld = "to-delete";

const players = [
  {
    value: "cross",
    className: markCross,
    lastMoves: [],
  },
  { value: "zero", className: markZero, lastMoves: [] },
];

// -----------

async function playIntro() {
  // todo(vmyshko): make different random intro animations

  // todo(vmyshko): play anims over existing field? do not delete cells?

  // intro animation
  const animSpeed = 500;

  await wait(animSpeed);

  for (let $cell of $cellGrid.children) {
    $cell.classList.add(markCross);
    // await wait(100);
  }

  await wait(animSpeed);

  for (let $cell of $cellGrid.children) {
    $cell.classList.remove(markCross);
    // await wait(100);
  }

  await wait(animSpeed);
  // end
}

async function initGrid() {
  $cellGrid.replaceChildren();

  const rowSize = cellCount ** 0.5;
  const colSize = cellCount ** 0.5;

  for (let rowIndex = 0; rowIndex < rowSize; rowIndex++) {
    for (let colIndex = 0; colIndex < colSize; colIndex++) {
      const cellFragment = $tmplCell.content.cloneNode(true); //fragment
      const $cell = cellFragment.firstElementChild;

      $cell.dataset.col = colIndex;
      $cell.dataset.row = rowIndex;

      $cell.addEventListener("click", onCellClick);
      $cellGrid.appendChild($cell);
    }
  }

  await playIntro();

  // todo(vmyshko): enable game
}

initGrid();

$btnPowerOff.addEventListener("click", initGrid);

function getCurrentPlayer() {
  return players[0];
}

function changePlayer() {
  players.push(players.shift());
}

function onCellClick() {
  const $cell = this;

  const { col, row } = $cell.dataset;

  console.log({ col, row }, $cell);

  const hasMark = [markCross, markZero].some((mark) => {
    return $cell.classList.contains(mark);
  });

  if (hasMark) {
    return;
  }

  //change player
  const currentPlayer = getCurrentPlayer();

  $cell.classList.add(currentPlayer.className);
  currentPlayer.lastMoves.push($cell);

  if (currentPlayer.lastMoves.length > maxMoves) {
    const $cellToRemoveMark = currentPlayer.lastMoves.shift();

    $cellToRemoveMark.classList.remove(currentPlayer.className);
    $cellToRemoveMark.classList.remove(markOld);
  }

  changePlayer();

  const opponentPlayer = getCurrentPlayer();

  if (opponentPlayer.lastMoves.length >= maxMoves) {
    const [$cellToMarkOld] = opponentPlayer.lastMoves;
    $cellToMarkOld.classList.add(markOld);
  }

  console.log(currentPlayer.lastMoves);
}

const animations = {
  disabled: [
    [{}, { backgroundColor: "dimgray", fontSize: "1.5rem" }, {}],
    {
      duration: 200,
      iterations: 1,
    },
  ],
  wrong: [
    [{}, { backgroundColor: "red", fontSize: "1.5rem" }, {}],
    {
      duration: 200,
      iterations: 1,
    },
  ],
  proper: [
    [{}, { backgroundColor: "greenyellow", fontSize: "1.5rem" }, {}],
    {
      duration: 300,
      iterations: 1,
    },
  ],
};
