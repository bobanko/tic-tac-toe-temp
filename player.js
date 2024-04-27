import { markCross, markZero } from "./config.js";
import { animateCell, animations } from "./animations.js";
import { wait } from "./helpers.js";

class Player {
  name = "🫥";
  //

  lastMoves = [];

  constructor({ mark }) {
    this.mark = mark;
  }

  makeMove() {
    console.error("not implemented");
  }
}

export class PlayerQueue {
  constructor(players) {
    this.players = players;
  }

  getCurrentPlayer() {
    return this.players[0];
  }

  nextPlayer() {
    this.players.push(this.players.shift());
    return this.players[0];
  }
}

export class PlayerHuman extends Player {
  name = "🧠";

  async makeMove({ $cellGrid }) {
    const self = this;
    console.log(`${self.name} player thinks...`);
    return new Promise((resolve) => {
      async function onCellClick(event) {
        if (!event.target.classList.contains("cell")) return;

        const $cell = event.target;

        const isMarkedCell = [markCross, markZero].some((mark) => {
          return $cell.classList.contains(mark);
        });

        if (isMarkedCell) {
          animateCell($cell, animations.wrong);
          return;
        }

        $cellGrid.removeEventListener("click", onCellClick);
        resolve($cell);
        console.log(`${self.name}  made move`, $cell);
      }

      $cellGrid.addEventListener("click", onCellClick);
    });
  }
}

export class PlayerAi extends Player {
  name = "🤖";

  async makeMove({ $cellGrid }) {
    const self = this;
    // todo(vmyshko): do ai move
    console.log(`${self.name} player thinks...`);
    return new Promise(async (resolve) => {
      // todo(vmyshko): select good ai cell

      await wait(500);

      for (let $cell of $cellGrid.children) {
        const isMarkedCell = [markCross, markZero].some((mark) => {
          return $cell.classList.contains(mark);
        });

        if (isMarkedCell) {
          animateCell($cell, animations.wrong);
          continue;
        }

        resolve($cell);
        console.log(`${self.name}  made move`, $cell);
        break;
      }
    });
  }
}
