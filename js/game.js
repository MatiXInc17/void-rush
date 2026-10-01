import { LEVELS } from "./data.js";
import { getCurrentUser, getUsers, saveUsers } from "./account.js";
import { gainXP } from "./progression.js";


export class Game {
  constructor() {
    this.canvas = document.getElementById("gameCanvas");
    this.ctx = this.canvas?.getContext("2d");

    this.menu = null;

    this.gameRunning = false;
    this.paused = false;

    this.currentLevelIndex = 0;
    this.levelData = null;

    this.score = 0;
    this.runCoins = 0;
    this.distance = 0;
    this.combo = 1;

    this.player = null;
    this.objects = [];
    this.particles = [];
    this.boss = null;

    this.spawnTimer = 0;
    this.orbTimer = 0;

    this.abilityCooldown = 0;

    this.lastTime = 0;
    this.animationFrame = null;

    this.keys = {};

    this.W = window.innerWidth;
    this.H = window.innerHeight;

    this.bindEvents();
    this.resize();

    window.addEventListener("resize", () => {
      this.resize();
    });
  }

  // =========================================
  // CONNECTION
  // =========================================

  setMenu(menu) {
    this.menu = menu;
  }

  // =========================================
  // INITIALIZATION
  // =========================================

  resize() {
    this.W = window.innerWidth;
    this.H = window.innerHeight;

    if (!this.canvas) {
      return;
    }

    this.canvas.width = this.W;
    this.canvas.height = this.H;
  }

  bindEvents() {
    window.addEventListener("keydown", event => {
      const key = event.key.toLowerCase();

      this.keys[key] = true;

      if (key === " " || key === "spacebar") {
        event.preventDefault();

        if (this.gameRunning && !this.paused) {
          this.activateAbility();
        }
      }

      if (key === "escape") {
        if (this.gameRunning) {
          this.pauseGame();
        }
      }
    });

    window.addEventListener("keyup", event => {
      const key = event.key.toLowerCase();

      this.keys[key] = false;
    });

    // Pause button
    document
      .getElementById("pauseBtn")
      ?.addEventListener("click", () => {
        this.pauseGame();
      });

    // Resume
    document
      .getElementById("resumeBtn")
      ?.addEventListener("click", () => {
        this.pauseGame();
      });

    // Exit from pause
    document
      .getElementById("pauseExitBtn")
      ?.addEventListener("click", () => {
        this.returnToMenu();
      });

    // Next level
    document
      .getElementById("nextLevelBtn")
      ?.addEventListener("click", () => {
        this.nextLevel();
      });

    // Complete → menu
    document
      .getElementById("completeMenuBtn")
      ?.addEventListener("click", () => {
        this.returnToMenu();
      });

    // Retry
    document
      .getElementById("retryBtn")
      ?.addEventListener("click", () => {
        this.restartGame();
      });

    // Game over → menu
    document
      .getElementById("gameOverMenuBtn")
      ?.addEventListener("click", () => {
        this.returnToMenu();
      });
  }

  // =========================================
  // START GAME
  // =========================================

  startGame(index = 0) {
    const user = getCurrentUser();

    if (!user) {
      return;
    }

    this.currentLevelIndex = index;
    this.levelData = LEVELS[index];

    if (!this.levelData) {
      return;
    }

    this.score = 0;
    this.runCoins = 0;
    this.distance = 0;
    this.combo = 1;

    this.objects = [];
    this.particles = [];

    this.boss = null;

    this.spawnTimer = 0;
    this.orbTimer = 0;

    this.abilityCooldown = 0;

    this.paused = false;
    this.gameRunning = true;

    this.createPlayer();

    this.hideAllOverlays();

    this.updateLevelUI();

    this.showScreen("game");

    this.lastTime = performance.now();

    cancelAnimationFrame(this.animationFrame);

    this.animationFrame = requestAnimationFrame(
      time => this.gameLoop(time)
    );
  }

  // =========================================
  // PLAYER
  // =========================================

  createPlayer() {
    const user = getCurrentUser();

    const character = {
      speed: 5.5,
      size: 18,
      luck: 1
    };

    // The real Player entity will replace this
    // temporary director-level object.
    this.player = {
      x: this.W * 0.18,
      y: this.H * 0.5,

      speed: character.speed,
      baseSpeed: character.speed,

      size: character.size,

      lives: 3,
      maxLives: 3,

      scoreMult: 1,

      magnet: 0,

      luck: character.luck,

      armor: 0,

      invincible: 0,

      levelUps: 0,

      color:
        this.currentLevelIndex % 2 === 0
          ? "#52f6ff"
          : "#9b6cff"
    };

    if (!user) {
      return;
    }

    const upgrades = user.upgrades || {};

    this.player.maxLives += upgrades.core || 0;
    this.player.lives = this.player.maxLives;

    this.player.scoreMult +=
      (upgrades.score || 0) * 0.12;

    this.player.magnet =
      (upgrades.magnet || 0) * 30;

    this.player.armor =
      upgrades.shield || 0;

    const characterData = this.getSelectedCharacter();

    if (characterData) {
      this.player.speed = characterData.speed;
      this.player.baseSpeed = characterData.speed;
      this.player.size = characterData.size;
      this.player.luck = characterData.luck;
    }
  }

  getSelectedCharacter() {
    const user = getCurrentUser();

    if (!user) {
      return null;
    }

    const characters = {
      pilot: {
        speed: 5.5,
        size: 18,
        luck: 1
      },

      comet: {
        speed: 7,
        size: 15,
        luck: 0.8
      },

      void: {
        speed: 5,
        size: 12,
        luck: 1.2
      },

      quantum: {
        speed: 5.2,
        size: 17,
        luck: 1.7
      }
    };

    return characters[user.selectedCharacter]
      || characters.pilot;
  }

  // =========================================
  // GAME LOOP
  // =========================================

  gameLoop(time) {
    if (!this.gameRunning) {
      return;
    }

    const delta = Math.min(
      (time - this.lastTime) / 16.67,
      2
    );

    this.lastTime = time;

    if (!this.paused) {
      this.update(delta);
      this.draw();
    }

    this.animationFrame =
      requestAnimationFrame(
        nextTime => this.gameLoop(nextTime)
      );
  }

  // =========================================
  // UPDATE
  // =========================================

  update(dt) {
    if (!this.player || !this.levelData) {
      return;
    }

    this.updatePlayer(dt);

    this.distance +=
      this.levelData.speed * dt * 2.1;

    this.score +=
      0.25 *
      this.player.scoreMult *
      this.combo *
      dt;

    this.spawnTimer += dt;
    this.orbTimer += dt;

    this.updateObjects(dt);
    this.updateParticles(dt);

    if (
      this.distance >=
      this.levelData.distance
    ) {
      this.completeLevel();

      return;
    }

    this.updateHUD();
  }

  // =========================================
  // PLAYER MOVEMENT
  // =========================================

  updatePlayer(dt) {
    let dx = 0;
    let dy = 0;

    if (
      this.keys["w"] ||
      this.keys["arrowup"]
    ) {
      dy -= 1;
    }

    if (
      this.keys["s"] ||
      this.keys["arrowdown"]
    ) {
      dy += 1;
    }

    if (
      this.keys["a"] ||
      this.keys["arrowleft"]
    ) {
      dx -= 1;
    }

    if (
      this.keys["d"] ||
      this.keys["arrowright"]
    ) {
      dx += 1;
    }

    if (dx !== 0 || dy !== 0) {
      const length = Math.hypot(dx, dy);

      dx /= length;
      dy /= length;
    }

    this.player.x +=
      dx * this.player.speed * dt;

    this.player.y +=
      dy * this.player.speed * dt;

    const padding = this.player.size;

    this.player.x = Math.max(
      padding,
      Math.min(
        this.W - padding,
        this.player.x
      )
    );

    this.player.y = Math.max(
      padding,
      Math.min(
        this.H - padding,
        this.player.y
      )
    );

    if (this.player.invincible > 0) {
      this.player.invincible -= dt;
    }
  }

  // =========================================
  // OBJECTS
  // =========================================

  updateObjects(dt) {
    /*
      IMPORTANT:

      Meteor, Orb and Hazard behavior will move into:

      js/entities/meteor.js
      js/entities/orb.js
      js/entities/hazards.js

      This director will eventually only call:

      object.update(dt)
      object.checkCollision(player)
    */

    for (let i = this.objects.length - 1; i >= 0; i--) {
      const object = this.objects[i];

      if (!object) {
        this.objects.splice(i, 1);
        continue;
      }

      if (typeof object.update === "function") {
        object.update(dt, this);
      }

      if (
        object.x < -100 ||
        object.x > this.W + 100 ||
        object.y < -100 ||
        object.y > this.H + 100
      ) {
        this.objects.splice(i, 1);
      }
    }
  }

  // =========================================
  // PARTICLES
  // =========================================

  updateParticles(dt) {
    for (
      let i = this.particles.length - 1;
      i >= 0;
      i--
    ) {
      const particle = this.particles[i];

      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;

      particle.life -= dt;

      if (particle.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  createBurst(
    x,
    y,
    color = "#52f6ff",
    count = 20
  ) {
    for (let i = 0; i < count; i++) {
      const angle =
        Math.random() * Math.PI * 2;

      const speed =
        Math.random() * 5 + 1;

      this.particles.push({
        x,
        y,

        vx:
          Math.cos(angle) * speed,

        vy:
          Math.sin(angle) * speed,

        life:
          Math.random() * 25 + 15,

        size:
          Math.random() * 3 + 1,

        color
      });
    }
  }

  // =========================================
  // ABILITY
  // =========================================

  activateAbility() {
    if (
      !this.player ||
      this.abilityCooldown > 0
    ) {
      return;
    }

    this.abilityCooldown = 180;

    this.player.invincible = 100;

    this.score += 100;

    this.createBurst(
      this.player.x,
      this.player.y,
      this.player.color,
      35
    );

    this.toast("PHASE SHIFT");
  }

  // =========================================
  // PAUSE
  // =========================================

  pauseGame() {
    if (!this.gameRunning) {
      return;
    }

    this.paused = !this.paused;

    const overlay =
      document.getElementById("pauseOverlay");

    if (overlay) {
      overlay.classList.toggle(
        "show",
        this.paused
      );
    }
  }

  // =========================================
  // COMPLETE
  // =========================================

  completeLevel() {
    if (!this.gameRunning) {
      return;
    }

    this.gameRunning = false;

    const user = getCurrentUser();

    if (!user) {
      return;
    }

    const xp = Math.floor(
      60 +
      this.currentLevelIndex * 35 +
      this.score / 100
    );

    const coins = Math.floor(
      this.runCoins +
      20 +
      this.currentLevelIndex * 5
    );

    const users = getUsers();
    const storedUser = users[user.username];

    if (!storedUser) {
      return;
    }

    storedUser.coins += coins;

    storedUser.wins += 1;

    storedUser.highScore =
      Math.max(
        storedUser.highScore,
        Math.floor(this.score)
      );

    saveUsers(users);

    const progression =
      gainXP(xp);

    this.showCompleteOverlay(
      xp,
      coins,
      progression
    );
  }

  showCompleteOverlay(
    xp,
    coins,
    progression
  ) {
    const overlay =
      document.getElementById(
        "completeOverlay"
      );

    if (!overlay) {
      return;
    }

    const title =
      overlay.querySelector("h2");

    const text =
      overlay.querySelector("p");

    const reward =
      overlay.querySelector(".reward");

    if (title) {
      title.textContent = "LEVEL COMPLETE";
    }

    if (text) {
      text.textContent =
        `Score: ${Math.floor(this.score)} • ` +
        `Distance: ${Math.floor(this.distance)}`;
    }

    if (reward) {
      reward.innerHTML = `
        <span>+${xp} XP</span>
        <span>+${coins} COINS</span>
      `;
    }

    overlay.classList.add("show");

    if (this.menu) {
      this.menu.updateMenu();
    }
  }

  // =========================================
  // GAME OVER
  // =========================================

  gameOver() {
    if (!this.gameRunning) {
      return;
    }

    this.gameRunning = false;

    const user = getCurrentUser();

    if (user) {
      const users = getUsers();
      const storedUser = users[user.username];

      if (storedUser) {
        storedUser.deaths += 1;

        storedUser.highScore =
          Math.max(
            storedUser.highScore,
            Math.floor(this.score)
          );

        storedUser.coins +=
          Math.floor(this.runCoins / 2);

        saveUsers(users);
      }
    }

    const overlay =
      document.getElementById(
        "gameOverOverlay"
      );

    if (overlay) {
      const text =
        overlay.querySelector("p");

      if (text) {
        text.textContent =
          `Score: ${Math.floor(this.score)}`;
      }

      overlay.classList.add("show");
    }

    if (this.menu) {
      this.menu.updateMenu();
    }
  }

  // =========================================
  // RESTART
  // =========================================

  restartGame() {
    const overlay =
      document.getElementById(
        "gameOverOverlay"
      );

    overlay?.classList.remove("show");

    this.startGame(
      this.currentLevelIndex
    );
  }

  // =========================================
  // NEXT LEVEL
  // =========================================

  nextLevel() {
    const overlay =
      document.getElementById(
        "completeOverlay"
      );

    overlay?.classList.remove("show");

    const nextIndex =
      this.currentLevelIndex + 1;

    if (nextIndex >= LEVELS.length) {
      this.returnToMenu();
      return;
    }

    this.startGame(nextIndex);
  }

  // =========================================
  // RETURN TO MENU
  // =========================================

  returnToMenu() {
    this.stopGame();

    this.hideAllOverlays();

    if (this.menu) {
      this.menu.updateMenu();
    }

    this.showScreen("menu");
  }

  stopGame() {
    this.gameRunning = false;
    this.paused = false;

    cancelAnimationFrame(
      this.animationFrame
    );

    this.animationFrame = null;
  }

  // =========================================
  // HUD
  // =========================================

  updateHUD() {
    this.setText(
      "scoreValue",
      Math.floor(this.score)
    );

    this.setText(
      "livesValue",
      this.player?.lives ?? 0
    );

    this.setText(
      "coinsValue",
      this.runCoins
    );

    this.setText(
      "comboValue",
      `x${this.combo}`
    );

    this.setText(
      "runLevel",
      this.levelData?.name || "UNKNOWN"
    );

    const progress =
      this.levelData
        ? Math.min(
            100,
            this.distance /
              this.levelData.distance *
              100
          )
        : 0;

    const progressBar =
      document.querySelector(
        "#levelProgress i"
      );

    if (progressBar) {
      progressBar.style.width =
        `${progress}%`;
    }

    if (this.abilityCooldown > 0) {
      this.abilityCooldown -= 1;
    }

    const ability =
      document.getElementById(
        "ability"
      );

    if (ability) {
      const cooldown =
        Math.max(
          0,
          Math.ceil(
            this.abilityCooldown / 60
          )
        );

      ability.classList.toggle(
        "ready",
        cooldown === 0
      );

      const small =
        ability.querySelector("small");

      if (small) {
        small.textContent =
          cooldown === 0
            ? "READY"
            : `${cooldown}s`;
      }
    }
  }

  updateLevelUI() {
    this.setText(
      "levelName",
      this.levelData?.name || ""
    );

    const bossBar =
      document.getElementById(
        "bossBar"
      );

    if (bossBar) {
      bossBar.classList.remove("show");
    }
  }

  // =========================================
  // DRAW
  // =========================================

  draw() {
    if (!this.ctx) {
      return;
    }

    const ctx = this.ctx;

    // Background
    const gradient =
      ctx.createRadialGradient(
        this.W * 0.5,
        this.H * 0.5,
        0,
        this.W * 0.5,
        this.H * 0.5,
        Math.max(this.W, this.H)
      );

    gradient.addColorStop(
      0,
      "#111936"
    );

    gradient.addColorStop(
      1,
      "#03040a"
    );

    ctx.fillStyle = gradient;

    ctx.fillRect(
      0,
      0,
      this.W,
      this.H
    );

    this.drawObjects();
    this.drawPlayer();
    this.drawParticles();
  }

  drawObjects() {
    for (const object of this.objects) {
      if (
        typeof object.draw === "function"
      ) {
        object.draw(
          this.ctx,
          this
        );
      }
    }
  }

  drawPlayer() {
    if (!this.player) {
      return;
    }

    const ctx = this.ctx;

    if (
      this.player.invincible > 0 &&
      Math.floor(
        this.player.invincible / 6
      ) % 2 === 0
    ) {
      return;
    }

    ctx.save();

    ctx.translate(
      this.player.x,
      this.player.y
    );

    ctx.shadowBlur = 20;
    ctx.shadowColor =
      this.player.color;

    ctx.fillStyle =
      this.player.color;

    ctx.beginPath();

    ctx.moveTo(
      this.player.size,
      0
    );

    ctx.lineTo(
      -this.player.size,
      -this.player.size * 0.7
    );

    ctx.lineTo(
      -this.player.size * 0.6,
      0
    );

    ctx.lineTo(
      -this.player.size,
      this.player.size * 0.7
    );

    ctx.closePath();

    ctx.fill();

    ctx.fillStyle = "#ffffff";

    ctx.beginPath();

    ctx.arc(
      2,
      0,
      3,
      0,
      Math.PI * 2
    );

    ctx.fill();

    ctx.restore();
  }

  drawParticles() {
    const ctx = this.ctx;

    for (const particle of this.particles) {
      ctx.globalAlpha =
        Math.max(
          0,
          particle.life / 40
        );

      ctx.fillStyle =
        particle.color;

      ctx.beginPath();

      ctx.arc(
        particle.x,
        particle.y,
        particle.size,
        0,
        Math.PI * 2
      );

      ctx.fill();
    }

    ctx.globalAlpha = 1;
  }

  // =========================================
  // UI HELPERS
  // =========================================

  showScreen(id) {
    document
      .querySelectorAll(".screen")
      .forEach(screen => {
        screen.classList.remove("active");
      });

    document
      .getElementById(id)
      ?.classList.add("active");
  }

  setText(id, value) {
    const element =
      document.getElementById(id);

    if (element) {
      element.textContent = value;
    }
  }

  hideAllOverlays() {
    document
      .querySelectorAll(".overlay")
      .forEach(overlay => {
        overlay.classList.remove("show");
      });
  }

  toast(message) {
    if (this.menu?.toast) {
      this.menu.toast(message);
    }
  }
}
