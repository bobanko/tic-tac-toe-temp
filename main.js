import {
  cellCount,
  rowSize,
  colSize,
  maxMoves,
  gameModes,
  markCross,
  markZero,
  markOld,
} from "./config.js";
import { wait } from "./helpers.js";
import {
  animateCell,
  animations,
  showFlashingMarkIntro,
} from "./animations.js";
import { PlayerAi, PlayerHuman, PlayerQueue } from "./player.js";

// -----------

// let currentGameMode = gameModes.singleplayer;
let currentGameMode = gameModes.multiplayer;

// -----------

async function playIntro(gameMode) {
  // todo(vmyshko): make different random intro animations
  // todo(vmyshko): play anims over existing field? do not delete cells?

  if ([gameModes.multiplayer, gameModes.singleplayer].includes(gameMode)) {
    await showFlashingMarkIntro({ mark: markCross, $cellGrid });
  }

  if ([gameModes.memory].includes(gameMode)) {
    await showFlashingMarkIntro({ mark: markZero, $cellGrid });
  }
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

async function initGrid(gameMode) {
  disableGrid();
  $cellGrid.replaceChildren();

  // create cells
  for (let rowIndex = 0; rowIndex < rowSize; rowIndex++) {
    for (let colIndex = 0; colIndex < colSize; colIndex++) {
      const cellFragment = $tmplCell.content.cloneNode(true); //fragment
      const $cell = cellFragment.firstElementChild;

      $cell.dataset.col = colIndex;
      $cell.dataset.row = rowIndex;

      $cellGrid.appendChild($cell);
    }
  }

  await playIntro(gameMode);

  //enable game
  enableGrid();

  const playerQueue = new PlayerQueue([
    // new PlayerAi({ mark: markCross }),
    // new PlayerAi({ mark: markCross }),
    new PlayerHuman({ mark: markCross }),
    new PlayerHuman({ mark: markZero }),
  ]);

  // todo(vmyshko): do in a loop until win
  do {
    const currentPlayer = playerQueue.getCurrentPlayer();

    const $cell = await currentPlayer.makeMove({ $cellGrid });

    {
      //change player
      $cell.classList.add(currentPlayer.mark);
      currentPlayer.lastMoves.push($cell);

      if (currentPlayer.lastMoves.length > maxMoves) {
        const $cellToRemoveMark = currentPlayer.lastMoves.shift();

        $cellToRemoveMark.classList.remove(currentPlayer.mark);
        $cellToRemoveMark.classList.remove(markOld);
      }

      const opponentPlayer = playerQueue.nextPlayer();

      if (opponentPlayer.lastMoves.length >= maxMoves) {
        const [$cellToMarkOld] = opponentPlayer.lastMoves;
        $cellToMarkOld.classList.add(markOld);
      }

      const { col, row } = $cell.dataset;

      const { isWin, winCells = [] } = checkWin({
        col,
        row,
        mark: currentPlayer.mark,
      });

      if (isWin) {
        disableGrid();
        console.log(`🏆 ${currentPlayer.name} ${currentPlayer.mark} wins`);
        console.log({ isWin, winCells });

        // anim win
        winCells.forEach(($cell) => {
          animateCell($cell, animations.win);
        });

        await wait(3000);

        break;
      }
    }
  } while (true);

  console.log("game finished, restarting...");

  //restart game
  initGrid(currentGameMode); //recursive call!!
}

// hanlders

$btnPowerOff.addEventListener("click", () => {
  $btnPowerOff.animate(...animations.push);
  initGrid(currentGameMode);
});

function changeGameMode(gameMode) {
  $btnModeSingleplayer.classList.remove("mode-selected");
  $btnModeMultiplayer.classList.remove("mode-selected");
  $btnModeMemory.classList.remove("mode-selected");

  currentGameMode = gameMode;

  switch (currentGameMode) {
    case gameModes.multiplayer: {
      $btnModeMultiplayer.classList.add("mode-selected");
      break;
    }
    case gameModes.singleplayer: {
      $btnModeSingleplayer.classList.add("mode-selected");
      break;
    }
    case gameModes.memory: {
      $btnModeMemory.classList.add("mode-selected");
      break;
    }
  }
  //todo

  initGrid(currentGameMode);
}

changeGameMode(gameModes.multiplayer);

$btnModeSingleplayer.addEventListener("click", () => {
  $btnModeSingleplayer.animate(...animations.push);

  changeGameMode(gameModes.singleplayer);
});

$btnModeMultiplayer.addEventListener("click", () => {
  $btnModeMultiplayer.animate(...animations.push);

  changeGameMode(gameModes.multiplayer);
});

$btnModeMemory.addEventListener("click", () => {
  $btnModeMemory.animate(...animations.push);

  changeGameMode(gameModes.memory);
});
