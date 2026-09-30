import {
    getCurrentUser,
    getUsers,
    updateCurrentUser,
    register,
    login,
    logout
} from "./account.js";

import {
    CHARACTERS,
    SHOP,
    LEVELS
} from "./data.js";

import {
    xpNeeded,
    getProgress
} from "./progression.js";


export class Menu {

    constructor(game) {

        this.game = game;

        this.authMode = "login";

        this.bindEvents();

        this.update();

    }


    bindEvents() {

        document
            .querySelector("#playBtn")
            .addEventListener(
                "click",
                () => this.openLevelSelect()
            );

        document
            .querySelector("#charactersBtn")
            .addEventListener(
                "click",
                () => this.openCharacters()
            );

        document
            .querySelector("#shopBtn")
            .addEventListener(
                "click",
                () => this.openShop()
            );

        document
            .querySelector("#profileBtn")
            .addEventListener(
                "click",
                () => this.openProfile()
            );

        document
            .querySelector("#logoutBtn")
            .addEventListener(
                "click",
                () => this.logout()
            );

        document
            .querySelector("#loginTab")
            .addEventListener(
                "click",
                () => this.switchAuth("login")
            );

        document
            .querySelector("#registerTab")
            .addEventListener(
                "click",
                () => this.switchAuth("register")
            );

        document
            .querySelector("#authSubmit")
            .addEventListener(
                "click",
                () => this.submitAuth()
            );

        document
            .querySelectorAll(".backMenu")
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => this.showScreen("menu")
                );

            });

    }


    showScreen(id) {

        document
            .querySelectorAll(".screen")
            .forEach(screen =>
                screen.classList.remove("active")
            );

        document
            .getElementById(id)
            .classList.add("active");

    }


    requireLogin() {

        if (!getCurrentUser()) {

            this.showScreen("auth");

            return false;

        }

        return true;

    }


    switchAuth(mode) {

        this.authMode = mode;

        document
            .querySelector("#loginTab")
            .classList.toggle(
                "active",
                mode === "login"
            );

        document
            .querySelector("#registerTab")
            .classList.toggle(
                "active",
                mode === "register"
            );

        document
            .querySelector("#authTitle")
            .textContent =
            mode === "login"
                ? "WELCOME BACK"
                : "CREATE PILOT";

        document
            .querySelector("#authMessage")
            .textContent = "";

    }


    submitAuth() {

        const username =
            document
                .querySelector("#authUsername")
                .value
                .trim();

        const password =
            document
                .querySelector("#authPassword")
                .value;

        const message =
            document.querySelector("#authMessage");


        if (username.length < 3) {

            message.textContent =
                "Username must contain at least 3 characters.";

            return;

        }


        if (password.length < 4) {

            message.textContent =
                "Password must contain at least 4 characters.";

            return;

        }


        const result =
            this.authMode === "login"
                ? login(username, password)
                : register(username, password);


        if (!result.ok) {

            message.textContent = result.message;

            return;

        }


        this.showScreen("menu");

        this.update();

        this.toast(
            this.authMode === "login"
                ? `WELCOME BACK, ${result.user.username.toUpperCase()}`
                : "ACCOUNT CREATED"
        );

    }


    logout() {

        logout();

        this.showScreen("auth");

        this.switchAuth("login");

    }


    update() {

        const user = getCurrentUser();

        if (!user) {

            document
                .querySelector("#menuUsername")
                .textContent = "GUEST";

            return;

        }


        document
            .querySelector("#menuUsername")
            .textContent = user.username;

        document
            .querySelector("#menuLevel")
            .textContent =
            `LEVEL ${user.level}`;

        document
            .querySelector("#menuCoins")
            .textContent = user.coins;

        document
            .querySelector("#menuHigh")
            .textContent = user.highScore;

        document
            .querySelector("#menuWins")
            .textContent = user.wins;

        document
            .querySelector("#menuBosses")
            .textContent = user.bosses;


        const progress = getProgress();

        document
            .querySelector("#menuXpText")
            .textContent =
            `${progress.xp} / ${progress.required} XP`;

        document
            .querySelector("#menuXpBar")
            .style.width =
            `${progress.percentage}%`;

    }


    openLevelSelect() {

        if (!this.requireLogin()) return;

        const container =
            document.querySelector("#levelCards");

        const user = getCurrentUser();

        container.innerHTML = "";

        LEVELS.forEach((level, index) => {

            const unlocked =
                index === 0 ||
                user.wins >= index;

            const card =
                document.createElement("div");

            card.className = "card";

            card.innerHTML = `

                <div class="card-icon">
                    ${level.boss ? "👹" : "🌌"}
                </div>

                <h3>
                    ${index + 1}. ${level.name}
                </h3>

                <p>
                    Distance: ${level.distance}<br>
                    Threat: ${Math.round(level.speed * 100)}%
                    ${level.boss
                        ? "<br>⚠ BOSS MISSION"
                        : ""}
                </p>

                <div class="card-actions">

                    <button
                        class="btn small ${unlocked ? "primary" : ""}"
                        ${unlocked ? "" : "disabled"}
                        data-level="${index}"
                    >
                        ${unlocked
                            ? "DEPLOY"
                            : "🔒 LOCKED"}
                    </button>

                </div>

            `;

            const button =
                card.querySelector("button");

            if (unlocked) {

                button.addEventListener(
                    "click",
                    () => this.game.start(index)
                );

            }

            container.appendChild(card);

        });


        this.showScreen("selectScreen");

    }


    openCharacters() {

        if (!this.requireLogin()) return;

        const container =
            document.querySelector("#characterCards");

        const user = getCurrentUser();

        container.innerHTML = "";

        Object.entries(CHARACTERS)
            .forEach(([id, character]) => {

                const owned =
                    user.ownedCharacters.includes(id);

                const selected =
                    user.selectedCharacter === id;

                const card =
                    document.createElement("div");

                card.className =
                    `card ${selected ? "selected" : ""}`;

                card.innerHTML = `

                    <div class="card-icon">
                        ${character.icon}
                    </div>

                    <h3>${character.name}</h3>

                    <p>
                        ${character.description}
                    </p>

                    <p style="margin-top:10px">

                        SPEED
                        <div class="bar">
                            <i style="
                                width:
                                ${Math.min(
                                    100,
                                    character.speed * 12
                                )}%
                            "></i>
                        </div>

                        SIZE
                        <div class="bar">
                            <i style="
                                width:
                                ${Math.max(
                                    15,
                                    100 - character.size * 4
                                )}%
                            "></i>
                        </div>

                        LUCK
                        <div class="bar">
                            <i style="
                                width:
                                ${Math.min(
                                    100,
                                    character.luck * 55
                                )}%
                            "></i>
                        </div>

                    </p>

                    <div class="price">
                        ${
                            owned
                                ? "OWNED"
                                : `🪙 ${character.cost}`
                        }
                    </div>

                    <div class="card-actions">

                        <button class="
                            btn small
                            ${selected ? "primary" : ""}
                        ">
                            ${
                                selected
                                    ? "SELECTED"
                                    : owned
                                        ? "SELECT"
                                        : "UNLOCK"
                            }
                        </button>

                    </div>
                `;


                card
                    .querySelector("button")
                    .addEventListener(
                        "click",
                        () => this.selectCharacter(id)
                    );


                container.appendChild(card);

            });


        this.showScreen("charactersScreen");

    }


    selectCharacter(id) {

        const user = getCurrentUser();

        const character = CHARACTERS[id];

        if (user.ownedCharacters.includes(id)) {

            updateCurrentUser(
                user => {
                    user.selectedCharacter = id;
                }
            );

            this.openCharacters();
            this.update();

            this.toast(
                `${character.name} SELECTED`
            );

            return;

        }


        if (user.coins < character.cost) {

            this.toast("NOT ENOUGH COINS");

            return;

        }


        updateCurrentUser(user => {

            user.coins -= character.cost;

            user.ownedCharacters.push(id);

            user.selectedCharacter = id;

        });


        this.openCharacters();
        this.update();

        this.toast(
            `${character.name} UNLOCKED!`
        );

    }


    openShop() {

        if (!this.requireLogin()) return;

        const container =
            document.querySelector("#shopCards");

        const user = getCurrentUser();

        document
            .querySelector("#shopCoins")
            .textContent = user.coins;

        container.innerHTML = "";


        Object.entries(SHOP)
            .forEach(([id, item]) => {

                const level =
                    user.upgrades[id];

                const price =
                    item.base * (level + 1);


                const card =
                    document.createElement("div");

                card.className = "card";

                card.innerHTML = `

                    <div class="card-icon">
                        ${item.icon}
                    </div>

                    <h3>${item.name}</h3>

                    <p>
                        ${item.description}
                    </p>

                    <div class="price">
                        LEVEL ${level}
                    </div>

                    <div class="card-actions">

                        <button class="
                            btn small primary
                        ">
                            🪙 ${price}
                        </button>

                    </div>

                `;


                card
                    .querySelector("button")
                    .addEventListener(
                        "click",
                        () => this.buyUpgrade(id)
                    );


                container.appendChild(card);

            });


        this.showScreen("shopScreen");

    }


    buyUpgrade(id) {

        const user = getCurrentUser();

        const item = SHOP[id];

        const level =
            user.upgrades[id];

        const price =
            item.base * (level + 1);


        if (user.coins < price) {

            this.toast("NOT ENOUGH COINS");

            return;

        }


        updateCurrentUser(user => {

            user.coins -= price;

            user.upgrades[id]++;

        });


        this.openShop();
        this.update();

        this.toast(
            `${item.name} UPGRADED`
        );

    }


    openProfile() {

        if (!this.requireLogin()) return;

        const user = getCurrentUser();

        document
            .querySelector("#profileName")
            .textContent = user.username;

        document
            .querySelector("#profileJoined")
            .textContent =
            `Joined ${user.created}`;

        document
            .querySelector("#profileLevel")
            .textContent =
            `LEVEL ${user.level}`;

        document
            .querySelector("#profileXp")
            .textContent =
            `${user.xp} XP`;

        document
            .querySelector("#profileWins")
            .textContent =
            user.wins;

        document
            .querySelector("#profileDeaths")
            .textContent =
            user.deaths;

        document
            .querySelector("#profileBosses")
            .textContent =
            user.bosses;

        document
            .querySelector("#profileCoins")
            .textContent =
            user.coins;


        this.showScreen("profileScreen");

    }


    toast(message) {

        const element =
            document.querySelector("#toast");

        element.textContent = message;

        element.classList.add("show");

        clearTimeout(this.toastTimer);

        this.toastTimer =
            setTimeout(
                () =>
                    element.classList.remove("show"),
                1600
            );

    }

}
