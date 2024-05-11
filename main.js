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
import { PlayerQueue } from "./player.js";
import { PlayerHuman } from "./player-human.js";
import { PlayerAi } from "./player-ai.js";

export function getCellPosition($cell) {
  const { col, row } = $cell.dataset;

  return { col: +col, row: +row };
}
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

export function getCell({ col, row }) {
  // todo(vmyshko): better to use matrix?
  const $cell = $cellGrid.querySelector(
    `.cell[data-col='${col}'][data-row='${row}']`
  );

  return $cell;
}

// todo(vmyshko): move to utils/helpers?
export function checkWin({ col, row, mark }) {
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

const gridAndControls = [$cellGrid, $controlPanel];

// todo(vmyshko): make generic, enable/disable provided elems
function disableGrid() {
  gridAndControls.forEach(($elem) => $elem.setAttribute("disabled", true));
}

function enableGrid() {
  gridAndControls.forEach(($elem) => $elem.removeAttribute("disabled"));
}

function createCells() {
  // create cells
  $cellGrid.replaceChildren();
  for (let rowIndex = 0; rowIndex < rowSize; rowIndex++) {
    for (let colIndex = 0; colIndex < colSize; colIndex++) {
      const cellFragment = $tmplCell.content.cloneNode(true); //fragment
      const $cell = cellFragment.firstElementChild;

      $cell.dataset.col = colIndex;
      $cell.dataset.row = rowIndex;

      $cellGrid.appendChild($cell);
    }
  }
}

const playerQueue = new PlayerQueue();

async function initGrid(gameMode) {
  disableGrid();

  createCells();

  await playIntro(gameMode);

  //enable game
  enableGrid();

  if (gameMode === gameModes.multiplayer) {
    playerQueue.refill([
      new PlayerHuman({ mark: markCross }),
      new PlayerHuman({ mark: markZero }),
    ]);
  } else if (gameMode === gameModes.singleplayer) {
    playerQueue.refill([
      new PlayerHuman({ mark: markCross }),
      new PlayerAi({ mark: markZero }),
    ]);
    //
  } else if (gameMode === gameModes.memory) {
    console.error("not impl");
    playerQueue.refill([
      // new PlayerMemoAi({ mark: markCross }),
      // new PlayerMemoHuman({ mark: markZero }),
    ]);
  }

  // todo(vmyshko): do in a loop until win
  while (true) {
    const currentPlayer = playerQueue.getCurrentPlayer();

    const { promise: move, resolve, reject } = Promise.withResolvers();

    currentPlayer.makeMove({ $cellGrid, resolve });

    let $cell;

    try {
      $cell = await move;
    } catch (err) {
      // todo(vmyshko): cancel everything!11

      console.log("🛑 game interrupted!!!");

      return;
    }

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

      const { col, row } = getCellPosition($cell);

      const { isWin, winCells = [] } = checkWin({
        col,
        row,
        mark: currentPlayer.mark,
      });

      if (isWin) {
        disableGrid();
        console.log(`🏆 ${currentPlayer.getInfo()} wins`);
        console.log({ isWin, winCells });

        // anim win
        winCells.forEach(($cell) => {
          animateCell($cell, animations.win);
        });
        // wait for all cells to play win anim + extra delay
        const [, { duration, iterations }] = animations.win;
        await wait(duration * (iterations + 1));

        break;
      }
    }
  }

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
