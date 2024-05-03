import { markCross, markZero } from "./config.js";
import { animateCell, animations } from "./animations.js";
import { wait } from "./helpers.js";

let uidcount = 0;

class Player {
  name = "🫥";
  //

  lastMoves = [];

  constructor({ mark }) {
    this.mark = mark;

    this.uid = uidcount++;
  }

  makeMove() {
    console.error("not implemented");
  }

  cancelMove() {}
}

export class PlayerQueue {
  constructor(players = []) {
    this.players = players;
  }

  refill(newPlayers = []) {
    this.players.splice(0, this.players.length, ...newPlayers);
  }

  getCurrentPlayer() {
    return this.players[0];
  }

  nextPlayer() {
    this.players.push(this.players.shift());
    return this.players[0];
  }
}

function hasMarks($cell) {
  return [markCross, markZero].some((mark) => {
    return $cell.classList.contains(mark);
  });
}

function getPlayerInfo(player) {
  const markEmoji = {
    [markCross]: "❌",
    [markZero]: "🔵",
  };

  return `${markEmoji[player.mark]}${player.name}[${player.uid}]`;
}

function waitForCellClick($grid) {
  let { promise, resolve, reject } = Promise.withResolvers();

  function clickResolver(event) {
    if (!event.target.classList.contains("cell")) return;

    const $cell = event.target;

    if (hasMarks($cell)) {
      animateCell($cell, animations.wrong);
      return;
    }

    resolve($cell);
    $grid.removeEventListener("click", clickResolver);

    console.log("move done");
  }

  function rejector() {
    reject();
    $grid.removeEventListener("click", clickResolver);
    console.log("move canceled");
  }

  $grid.addEventListener("click", clickResolver);

  return { promise, reject: rejector };
}

export class PlayerHuman extends Player {
  name = "🧠";

  cancelMove() {
    const self = this;

    self.reject();
    console.log(`🛑 ${getPlayerInfo(self)} move cancelled`);
  }

  async makeMove({ $cellGrid, resolve }) {
    const self = this;

    console.log(`${getPlayerInfo(self)} player thinks...`);

    const { promise, reject } = waitForCellClick($cellGrid);

    this.reject = reject;

    try {
      const $cell = await promise;

      console.log(`${getPlayerInfo(self)} made move`, $cell);

      resolve($cell);
    } catch {
      console.log(`🛑 ${getPlayerInfo(self)} move cancelled?`);
    }
  }
}

export class PlayerAi extends Player {
  name = "🤖";

  cancelMove() {
    console.log(`🛑 ${getPlayerInfo(self)} move cancelled?`);
  }

  async makeMove({ $cellGrid, resolve }) {
    const self = this;

    // todo(vmyshko): do ai move
    console.log(`${getPlayerInfo(self)} player thinks...`);

    // todo(vmyshko): select good ai cell
    await wait(300);

    for (let $cell of $cellGrid.children) {
      if (hasMarks($cell)) {
        animateCell($cell, animations.wrong);
        continue;
      }

      resolve($cell);
      console.log(`${getPlayerInfo(self)} made move`, $cell);
      break;
    }
  }
}
