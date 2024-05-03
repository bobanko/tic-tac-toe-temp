import { animateCell, animations } from "./animations.js";
import { markCross, markZero } from "./config.js";

let uidcount = 0;

export class Player {
  name = "🫥";
  //

  lastMoves = [];

  constructor({ mark }) {
    this.mark = mark;

    this.uid = uidcount++;
  }

  getInfo() {
    const markEmoji = {
      [markCross]: "❌",
      [markZero]: "🔵",
    };

    return `${this.name}${markEmoji[this.mark]}[${this.uid}]`;
  }

  makeMove() {
    console.error("not implemented");
  }

  cancelMove() {
    console.error("not implemented");
  }

  checkCell($cell) {
    if (hasMarks($cell)) {
      animateCell($cell, animations.wrong);
      return false;
    }

    return true;
  }
}

export class PlayerQueue {
  constructor(players = []) {
    this.players = players;
  }

  refill(newPlayers = []) {
    //cancel player's move from prev game
    const currentPlayer = this.getCurrentPlayer();
    currentPlayer?.cancelMove();

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

export function hasMarks($cell) {
  return [markCross, markZero].some((mark) => {
    return $cell.classList.contains(mark);
  });
}
