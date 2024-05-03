import { Player } from "./player.js";

export class PlayerHuman extends Player {
  name = "🧠";

  cancelMove() {
    const self = this;

    self.reject?.();
  }

  // todo(vmyshko): put into human
  waitForCellClick($grid) {
    const self = this;

    let { promise, resolve, reject } = Promise.withResolvers();

    function clickResolver(event) {
      if (!event.target.classList.contains("cell")) return;

      const $cell = event.target;

      // todo(vmyshko): move to player?
      if (!self.checkCell($cell)) return;

      resolve($cell);
      $grid.removeEventListener("click", clickResolver);

      console.log(`${self.getInfo()} move done`);
    }

    function rejector() {
      reject();
      $grid.removeEventListener("click", clickResolver);
      console.log(`🛑 ${self.getInfo()} move cancelled`);
    }

    $grid.addEventListener("click", clickResolver);

    return { promise, reject: rejector };
  }

  async makeMove({ $cellGrid, resolve }) {
    const self = this;

    console.log(`${self.getInfo()} player thinks...`);

    const { promise, reject } = this.waitForCellClick($cellGrid);

    this.reject = reject;

    try {
      const $cell = await promise;

      console.log(`${self.getInfo()} made move`, $cell);

      resolve($cell);
    } catch {
      console.log("rejected human");
    }
  }
}
