// $cellGrid.addEventListener("click", (event) => {
//   if (!event.target.classList.contains("cell")) return;

//   console.log(event.target);
// });

const cellCount = 9;
const maxMoves = 3;

function initGrid() {
  $cellGrid.replaceChildren();

  for (let cellIndex = 0; cellIndex < cellCount; cellIndex++) {
    const cellFragment = $tmplCell.content.cloneNode(true); //fragment
    const $cell = cellFragment.firstElementChild;

    $cell.addEventListener("click", onCellClick);
    $cellGrid.appendChild($cell);
  }
}

initGrid();

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

function getCurrentPlayer() {
  return players[0];
}

function changePlayer() {
  players.push(players.shift());
}

function onCellClick() {
  const $cell = this;

  console.log($cell);

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
