import { Menu } from "./menu.js";


// =========================================
// VOID RUSH — APPLICATION ENTRY POINT
// =========================================

class App {
  constructor() {
    this.menu = null;
    this.game = null;
  }

  init() {
    // Create the menu system first.
    this.menu = new Menu();

    // Game will be connected here once game.js exists.
    //
    // Example later:
    //
    // this.game = new Game();
    // this.menu.setGame(this.game);

    this.createBackground();
  }

  // =========================================
  // BACKGROUND
  // =========================================

  createBackground() {
    const background = document.getElementById("background");

    if (!background) {
      return;
    }

    background.innerHTML = "";

    const starCount = 70;

    for (let i = 0; i < starCount; i++) {
      const star = document.createElement("div");

      star.className = "star";

      star.style.left = `${Math.random() * 100}%`;
      star.style.top = `${Math.random() * 100}%`;

      const size = Math.random() * 2 + 1;

      star.style.width = `${size}px`;
      star.style.height = `${size}px`;

      star.style.animationDelay = `${Math.random() * 3}s`;
      star.style.animationDuration = `${2 + Math.random() * 4}s`;

      background.appendChild(star);
    }
  }
}


// =========================================
// START APPLICATION
// =========================================

const app = new App();

app.init();

export { app };
