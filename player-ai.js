import { wait } from "./helpers.js";
import { Player } from "./player.js";

export class PlayerAi extends Player {
  name = "🤖";

  cancelMove() {
    console.log(`🛑 ${self.getInfo()} move cancelled?`);
    // todo(vmyshko): cancel ai move truly
  }

  async makeMove({ $cellGrid, resolve }) {
    const self = this;

    // todo(vmyshko): do ai move
    console.log(`${self.getInfo()} player thinks...`);

    // todo(vmyshko): select good ai cell
    await wait(300);

    for (let $cell of $cellGrid.children) {
      if (!this.checkCell($cell)) continue;

      resolve($cell);
      console.log(`${self.getInfo()} made move`, $cell);
      break;
    }
  }
}
