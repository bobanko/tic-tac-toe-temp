import { colSize, markCross, markOld, markZero, rowSize } from "./config.js";
import { wait } from "./helpers.js";
import { getCell, getCellPosition } from "./main.js";
import { Player, hasMarks } from "./player.js";

function checkPossibleWin({ col, row, mark }) {
  const rowCells = [];
  const colCells = [];
  const mainDiagCells = [];
  const altDiagCells = [];

  // todo(vmyshko): get rid of getCell?
  // grab possible win lines
  for (let rowIndex = 0; rowIndex < rowSize; rowIndex++) {
    mainDiagCells.push(getCell({ col: rowIndex, row: rowIndex }));
    colCells.push(getCell({ col: rowIndex, row: row }));
    rowCells.push(getCell({ col: col, row: rowIndex }));
    altDiagCells.push(getCell({ col: colSize - 1 - rowIndex, row: rowIndex }));
  }

  for (let lineCells of [rowCells, colCells, mainDiagCells, altDiagCells]) {
    const isWin = lineCells.every(($cell) => {
      const pos = getCellPosition($cell);

      return (
        ($cell.classList.contains(mark) &&
          !$cell.classList.contains(markOld)) ||
        //is checked cell
        (pos.col === col && pos.row === row)
      );
    });

    if (isWin) {
      return { isWin, winCells: lineCells };
    }
  }

  return { isWin: false, lineCells: [] };
}

export class PlayerAi extends Player {
  name = "🤖";

  cellPriorities;

  constructor(...args) {
    super(...args);

    [this.opponentMark] = [markCross, markZero].filter(
      (mark) => mark !== this.mark
    );
  }

  resetPriorities() {
    this.cellPriorities = Array(rowSize)
      .fill(null)
      .map(() => Array(colSize).fill(0));
  }

  getPriority({ row, col }) {
    return this.cellPriorities[row][col];
  }

  increasePriority({ row, col, count = 1 }) {
    this.cellPriorities[row][col] += count;
  }

  getBestMove() {
    let maxPriority = -1;
    let bestRow = null;
    let bestCol = null;
    for (let col = 0; col < colSize; col++) {
      for (let row = 0; row < rowSize; row++) {
        //
        const currentPriority = this.getPriority({ col, row });
        if (currentPriority > maxPriority) {
          maxPriority = currentPriority;
          bestRow = row;
          bestCol = col;
        }
      }
    }

    return { col: bestCol, row: bestRow };
  }

  isOnDiagonal({ row, col }) {
    return row === col || row + col === rowSize - 1;
  }

  cancelMove() {
    const self = this;
    console.log(`🛑 ${self.getInfo()} move cancelled?`);
    // todo(vmyshko): cancel ai move truly
  }

  async makeMove({ $cellGrid, resolve }) {
    const self = this;

    // todo(vmyshko): do ai move
    console.log(`${self.getInfo()} player thinks...`);

    this.resetPriorities();
    // todo(vmyshko): select good ai cell

    for (let $cell of $cellGrid.children) {
      const { col, row } = getCellPosition($cell);

      if (hasMarks($cell)) {
        this.increasePriority({ row, col, count: -1 });
        continue;
      }

      //prioritize center cell
      if (col === 1 && row === 1) {
        this.increasePriority({ row, col });
      }
      //prior diags
      if (this.isOnDiagonal({ col, row })) {
        this.increasePriority({ row, col });
      }

      {
        //check victory rival - prevent
        const { isWin } = checkPossibleWin({
          col,
          row,
          mark: this.opponentMark,
        });
        if (isWin) {
          this.increasePriority({ row, col, count: 10 });
        }
      }

      {
        //check victory self - try to win
        const { isWin } = checkPossibleWin({ col, row, mark: this.mark });
        if (isWin) {
          this.increasePriority({ row, col, count: 100 });
        }
      }
    }
    //select best move
    const { row: bestRow, col: bestCol } = this.getBestMove();

    console.log(this.cellPriorities);

    await wait(500);

    for (let $cell of $cellGrid.children) {
      const { col, row } = getCellPosition($cell);

      if (col === bestCol && row === bestRow) {
        resolve($cell);

        console.log(`${self.getInfo()} made move`, $cell);
        break;
      }
    }
  }
}
