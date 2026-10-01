import {
  CHARACTERS,
  SHOP,
  LEVELS
} from "./data.js";

import {
  getCurrentUser,
  updateCurrentUser,
  registerUser,
  loginUser,
  logoutUser,
  getUsers,
  saveUsers
} from "./account.js";

export class Menu {
  constructor(game = null) {
    this.game = game;

    this.cacheElements();
    this.bindEvents();

    this.initialize();
  }

  // =========================================
  // CONNECTION
  // =========================================

  setGame(game) {
    this.game = game;
  }

  // =========================================
  // DOM
  // =========================================

  cacheElements() {
    // Screens
    this.menuScreen = document.getElementById("menu");
    this.authScreen = document.getElementById("auth");
    this.selectScreen = document.getElementById("selectScreen");
    this.charactersScreen = document.getElementById("charactersScreen");
    this.shopScreen = document.getElementById("shopScreen");
    this.profileScreen = document.getElementById("profileScreen");

    // Menu
    this.playBtn = document.getElementById("playBtn");
    this.charactersBtn = document.getElementById("charactersBtn");
    this.shopBtn = document.getElementById("shopBtn");
    this.profileBtn = document.getElementById("profileBtn");
    this.logoutBtn = document.getElementById("logoutBtn");

    // Account display
    this.menuAvatar = document.getElementById("menuAvatar");
    this.menuUsername = document.getElementById("menuUsername");
    this.menuLevel = document.getElementById("menuLevel");
    this.menuXP = document.getElementById("menuXP");
    this.menuCoins = document.getElementById("menuCoins");
    this.menuHighScore = document.getElementById("menuHighScore");
    this.menuWins = document.getElementById("menuWins");
    this.menuBosses = document.getElementById("menuBosses");

    // Auth
    this.loginTab = document.getElementById("loginTab");
    this.registerTab = document.getElementById("registerTab");
    this.usernameInput = document.getElementById("authUsername");
    this.passwordInput = document.getElementById("authPassword");
    this.authSubmit = document.getElementById("authSubmit");
    this.authMessage = document.getElementById("authMessage");

    // Dynamic panels
    this.levelCards = document.getElementById("levelCards");
    this.characterCards = document.getElementById("characterCards");
    this.shopCards = document.getElementById("shopCards");

    // Profile
    this.profileUsername = document.getElementById("profileUsername");
    this.profileLevel = document.getElementById("profileLevel");
    this.profileXP = document.getElementById("profileXP");
    this.profileCoins = document.getElementById("profileCoins");
    this.profileHighScore = document.getElementById("profileHighScore");
    this.profileWins = document.getElementById("profileWins");
    this.profileDeaths = document.getElementById("profileDeaths");
    this.profileBosses = document.getElementById("profileBosses");
    this.profileJoined = document.getElementById("profileJoined");

    // Toast
    this.toastElement = document.getElementById("toast");
    this.toastTimeout = null;
  }

  // =========================================
  // EVENTS
  // =========================================

  bindEvents() {
    // Main menu
    this.playBtn?.addEventListener("click", () => {
      this.openLevelSelect();
    });

    this.charactersBtn?.addEventListener("click", () => {
      this.openCharacters();
    });

    this.shopBtn?.addEventListener("click", () => {
      this.openShop();
    });

    this.profileBtn?.addEventListener("click", () => {
      this.openProfile();
    });

    this.logoutBtn?.addEventListener("click", () => {
      this.logout();
    });

    // Auth
    this.loginTab?.addEventListener("click", () => {
      this.switchAuth("login");
    });

    this.registerTab?.addEventListener("click", () => {
      this.switchAuth("register");
    });

    this.authSubmit?.addEventListener("click", () => {
      this.submitAuth();
    });

    this.passwordInput?.addEventListener("keydown", event => {
      if (event.key === "Enter") {
        this.submitAuth();
      }
    });

    this.usernameInput?.addEventListener("keydown", event => {
      if (event.key === "Enter") {
        this.submitAuth();
      }
    });

    // Back buttons
    document.querySelectorAll(".backMenu").forEach(button => {
      button.addEventListener("click", () => {
        this.showScreen("menu");
      });
    });

    // Dynamic level cards
    this.levelCards?.addEventListener("click", event => {
      const button = event.target.closest("[data-level-index]");

      if (!button || button.disabled) {
        return;
      }

      const index = Number(button.dataset.levelIndex);

      if (this.game?.startGame) {
        this.showScreen("game");
        this.game.startGame(index);
      }
    });

    // Dynamic character cards
    this.characterCards?.addEventListener("click", event => {
      const button = event.target.closest("[data-character-id]");

      if (!button || button.disabled) {
        return;
      }

      this.selectCharacter(button.dataset.characterId);
    });

    // Dynamic shop cards
    this.shopCards?.addEventListener("click", event => {
      const button = event.target.closest("[data-upgrade-id]");

      if (!button || button.disabled) {
        return;
      }

      this.buyUpgrade(button.dataset.upgradeId);
    });
  }

  // =========================================
  // INITIALIZATION
  // =========================================

  initialize() {
    if (getCurrentUser()) {
      this.updateMenu();
      this.showScreen("menu");
    } else {
      this.showScreen("auth");
    }
  }

  // =========================================
  // SCREENS
  // =========================================

  showScreen(id) {
    document.querySelectorAll(".screen").forEach(screen => {
      screen.classList.remove("active");
    });

    const screen = document.getElementById(id);

    if (screen) {
      screen.classList.add("active");
    }
  }

  requireLogin() {
    if (!getCurrentUser()) {
      this.showScreen("auth");
      this.setAuthMessage("Please log in first.", true);
      return false;
    }

    return true;
  }

  // =========================================
  // AUTH
  // =========================================

  switchAuth(mode) {
    const isLogin = mode === "login";

    this.loginTab?.classList.toggle("active", isLogin);
    this.registerTab?.classList.toggle("active", !isLogin);

    if (this.authSubmit) {
      this.authSubmit.textContent = isLogin
        ? "ENTER VOID"
        : "CREATE ACCOUNT";
    }

    this.setAuthMessage("");
  }

  submitAuth() {
    const username = this.usernameInput?.value.trim() || "";
    const password = this.passwordInput?.value || "";

    const isLogin = this.loginTab?.classList.contains("active");

    if (!username || !password) {
      this.setAuthMessage("Enter a username and password.", true);
      return;
    }

    let result;

    if (isLogin) {
      result = loginUser(username, password);
    } else {
      result = registerUser(username, password);
    }

    if (!result.success) {
      this.setAuthMessage(result.message, true);
      return;
    }

    this.setAuthMessage("");

    if (this.usernameInput) {
      this.usernameInput.value = "";
    }

    if (this.passwordInput) {
      this.passwordInput.value = "";
    }

    this.updateMenu();
    this.showScreen("menu");

    this.toast(
      isLogin
        ? `Welcome back, ${username}.`
        : `Account created. Welcome, ${username}.`
    );
  }

  setAuthMessage(message, error = false) {
    if (!this.authMessage) {
      return;
    }

    this.authMessage.textContent = message;
    this.authMessage.style.color = error
      ? "var(--red)"
      : "var(--muted)";
  }

  logout() {
    logoutUser();

    if (this.game?.stopGame) {
      this.game.stopGame();
    }

    this.showScreen("auth");
    this.switchAuth("login");

    this.toast("Logged out.");
  }

  // =========================================
  // MENU
  // =========================================

  updateMenu() {
    const user = getCurrentUser();

    if (!user) {
      return;
    }

    if (this.menuAvatar) {
      const character = CHARACTERS[user.selectedCharacter] || CHARACTERS.pilot;
      this.menuAvatar.textContent = character.icon;
    }

    if (this.menuUsername) {
      this.menuUsername.textContent = user.username;
    }

    if (this.menuLevel) {
      this.menuLevel.textContent = `LEVEL ${user.level}`;
    }

    if (this.menuXP) {
      this.menuXP.textContent = `${user.xp} XP`;
    }

    if (this.menuCoins) {
      this.menuCoins.textContent = user.coins;
    }

    if (this.menuHighScore) {
      this.menuHighScore.textContent = user.highScore;
    }

    if (this.menuWins) {
      this.menuWins.textContent = user.wins;
    }

    if (this.menuBosses) {
      this.menuBosses.textContent = user.bosses;
    }
  }

  // =========================================
  // LEVEL SELECT
  // =========================================

  openLevelSelect() {
    if (!this.requireLogin()) {
      return;
    }

    const user = getCurrentUser();

    this.levelCards.innerHTML = LEVELS.map((level, index) => {
      const unlocked = index === 0 || user.wins >= index;

      const bossText = level.boss
        ? `<span class="price">⚠ BOSS</span>`
        : "";

      return `
        <div class="card ${unlocked ? "" : "locked"}">
          <div class="card-icon" style="color:${level.color}">
            ${String(index + 1).padStart(2, "0")}
          </div>

          <h3>${level.name}</h3>

          <p>
            Distance: ${level.distance}
            <br>
            Speed: ×${level.speed}
          </p>

          ${bossText}

          <div class="card-actions">
            <button
              class="btn ${unlocked ? "primary" : "small"}"
              data-level-index="${index}"
              ${unlocked ? "" : "disabled"}
            >
              ${unlocked ? "PLAY" : "🔒 LOCKED"}
            </button>
          </div>
        </div>
      `;
    }).join("");

    this.showScreen("selectScreen");
  }

  // =========================================
  // CHARACTERS
  // =========================================

  openCharacters() {
    if (!this.requireLogin()) {
      return;
    }

    const user = getCurrentUser();

    this.characterCards.innerHTML = Object.entries(CHARACTERS)
      .map(([id, character]) => {
        const owned = user.ownedCharacters.includes(id);
        const selected = user.selectedCharacter === id;

        const speedPercent = Math.min(100, character.speed / 8 * 100);
        const sizePercent = Math.min(100, character.size / 20 * 100);
        const luckPercent = Math.min(100, character.luck / 2 * 100);

        let actionText = "SELECT";
        let disabled = false;

        if (selected) {
          actionText = "SELECTED";
          disabled = true;
        } else if (!owned) {
          actionText = `BUY • ${character.cost}`;
        }

        return `
          <div class="card ${selected ? "selected" : ""}">
            <div class="card-icon">${character.icon}</div>

            <h3>${character.name}</h3>

            <p>${character.description}</p>

            <div class="small-text">SPEED</div>
            <div class="bar">
              <i style="width:${speedPercent}%"></i>
            </div>

            <div class="small-text">SIZE</div>
            <div class="bar">
              <i style="width:${sizePercent}%"></i>
            </div>

            <div class="small-text">LUCK</div>
            <div class="bar">
              <i style="width:${luckPercent}%"></i>
            </div>

            <div class="card-actions">
              <button
                class="btn ${selected ? "small" : "primary"}"
                data-character-id="${id}"
                ${disabled ? "disabled" : ""}
              >
                ${actionText}
              </button>
            </div>
          </div>
        `;
      })
      .join("");

    this.showScreen("charactersScreen");
  }

  selectCharacter(id) {
    const user = getCurrentUser();
    const character = CHARACTERS[id];

    if (!user || !character) {
      return;
    }

    const owned = user.ownedCharacters.includes(id);

    if (owned) {
      const users = getUsers();

      users[user.username].selectedCharacter = id;

      saveUsers(users);

      this.updateMenu();
      this.openCharacters();

      this.toast(`${character.name} selected.`);
      return;
    }

    if (user.coins < character.cost) {
      this.toast("Not enough coins.");
      return;
    }

    const users = getUsers();
    const storedUser = users[user.username];

    storedUser.coins -= character.cost;
    storedUser.ownedCharacters.push(id);
    storedUser.selectedCharacter = id;

    saveUsers(users);

    this.updateMenu();
    this.openCharacters();

    this.toast(`${character.name} unlocked!`);
  }

  // =========================================
  // SHOP
  // =========================================

  openShop() {
    if (!this.requireLogin()) {
      return;
    }

    const user = getCurrentUser();

    this.shopCards.innerHTML = Object.entries(SHOP)
      .map(([id, item]) => {
        const level = user.upgrades[id] || 0;
        const price = item.base * (level + 1);

        return `
          <div class="card">
            <div class="card-icon">${item.icon}</div>

            <h3>${item.name}</h3>

            <p>${item.description}</p>

            <div class="small-text">
              LEVEL ${level}
            </div>

            <div class="bar">
              <i style="width:${Math.min(100, level * 20)}%"></i>
            </div>

            <div class="price">
              ${price} COINS
            </div>

            <div class="card-actions">
              <button
                class="btn primary"
                data-upgrade-id="${id}"
              >
                UPGRADE
              </button>
            </div>
          </div>
        `;
      })
      .join("");

    this.showScreen("shopScreen");
  }

  buyUpgrade(id) {
    const user = getCurrentUser();
    const item = SHOP[id];

    if (!user || !item) {
      return;
    }

    const currentLevel = user.upgrades[id] || 0;
    const price = item.base * (currentLevel + 1);

    if (user.coins < price) {
      this.toast("Not enough coins.");
      return;
    }

    const users = getUsers();
    const storedUser = users[user.username];

    storedUser.coins -= price;
    storedUser.upgrades[id] = currentLevel + 1;

    saveUsers(users);

    this.updateMenu();
    this.openShop();

    this.toast(`${item.name} upgraded to level ${currentLevel + 1}.`);
  }

  // =========================================
  // PROFILE
  // =========================================

  openProfile() {
    if (!this.requireLogin()) {
      return;
    }

    const user = getCurrentUser();

    if (this.profileUsername) {
      this.profileUsername.textContent = user.username;
    }

    if (this.profileLevel) {
      this.profileLevel.textContent = user.level;
    }

    if (this.profileXP) {
      this.profileXP.textContent = user.xp;
    }

    if (this.profileCoins) {
      this.profileCoins.textContent = user.coins;
    }

    if (this.profileHighScore) {
      this.profileHighScore.textContent = user.highScore;
    }

    if (this.profileWins) {
      this.profileWins.textContent = user.wins;
    }

    if (this.profileDeaths) {
      this.profileDeaths.textContent = user.deaths;
    }

    if (this.profileBosses) {
      this.profileBosses.textContent = user.bosses;
    }

    if (this.profileJoined) {
      this.profileJoined.textContent = new Date(
        user.created
      ).toLocaleDateString();
    }

    this.showScreen("profileScreen");
  }

  // =========================================
  // TOAST
  // =========================================

  toast(message) {
    if (!this.toastElement) {
      return;
    }

    this.toastElement.textContent = message;
    this.toastElement.classList.add("show");

    clearTimeout(this.toastTimeout);

    this.toastTimeout = setTimeout(() => {
      this.toastElement.classList.remove("show");
    }, 2200);
  }
}
