// helpers
export function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// -----------

const cellCount = 9;

const rowSize = cellCount ** 0.5;
const colSize = cellCount ** 0.5;
const maxMoves = rowSize;

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

function getCell({ col, row }) {
  // todo(vmyshko): better to use matrix?
  const $cell = $cellGrid.querySelector(
    `.cell[data-col='${col}'][data-row='${row}']`
  );

  return $cell;
}

function checkWin({ col, row, mark }) {
  const rowCells = [];
  const colCells = [];
  const mainDiagCells = [];
  const altDiagCells = [];

  // grab possible win lines
  for (let rowIndex = 0; rowIndex < rowSize; rowIndex++) {
    mainDiagCells.push(getCell({ col: rowIndex, row: rowIndex }));
    colCells.push(getCell({ col: rowIndex, row: row }));
    rowCells.push(getCell({ col: col, row: rowIndex }));
    altDiagCells.push(getCell({ col: colSize - 1 - rowIndex, row: rowIndex }));
  }

  for (let lineCells of [rowCells, colCells, mainDiagCells, altDiagCells]) {
    const isWin = lineCells.every(($cell) => $cell.classList.contains(mark));

    if (isWin) {
      return { isWin, winCells: lineCells };
    }
  }

  return { isWin: false, lineCells: [] };
}

function disableGrid() {
  $cellGrid.setAttribute("disabled", true);
}

function enableGrid() {
  $cellGrid.removeAttribute("disabled");
}

async function initGrid() {
  disableGrid();
  $cellGrid.replaceChildren();

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

  //enable game
  enableGrid();
}

initGrid();

$btnPowerOff.addEventListener("click", initGrid);

function getCurrentPlayer() {
  return players[0];
}

function changePlayer() {
  players.push(players.shift());
}

async function onCellClick() {
  const $cell = this;

  const { col, row } = $cell.dataset;

  console.log({ col, row }, $cell);

  const hasMark = [markCross, markZero].some((mark) => {
    return $cell.classList.contains(mark);
  });

  if (hasMark) {
    animateCell($cell, animations.wrong);
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

  const { isWin, winCells = [] } = checkWin({
    col,
    row,
    mark: currentPlayer.className,
  });

  if (isWin) {
    disableGrid();
    console.log({ isWin, winCells });

    // anim win
    winCells.forEach(($cell) => {
      animateCell($cell, animations.win);
    });

    await wait(3000);
    //restart game
    initGrid();
  }
}

function animateCell($cell, animation) {
  [...$cell.children].forEach(($child) => $child.animate(...animation));
}

const animations = {
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
  proper: [
    [{}, { backgroundColor: "greenyellow", fontSize: "1.5rem" }, {}],
    {
      duration: 300,
      iterations: 1,
    },
  ],
};
