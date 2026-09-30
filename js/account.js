const USERS_KEY = "voidRushUsers";
const CURRENT_KEY = "voidRushCurrent";

export function getUsers() {
    return JSON.parse(
        localStorage.getItem(USERS_KEY) || "{}"
    );
}

export function saveUsers(users) {
    localStorage.setItem(
        USERS_KEY,
        JSON.stringify(users)
    );
}

export function getCurrentUserKey() {
    return localStorage.getItem(CURRENT_KEY);
}

export function setCurrentUser(key) {
    localStorage.setItem(CURRENT_KEY, key);
}

export function clearCurrentUser() {
    localStorage.removeItem(CURRENT_KEY);
}

export function getCurrentUser() {

    const key = getCurrentUserKey();
    const users = getUsers();

    if (!key || !users[key]) {
        return null;
    }

    return users[key];
}

export function createDefaultUser(username, password) {

    return {

        username,
        password,

        created: new Date().toLocaleDateString(),

        level: 1,
        xp: 0,

        coins: 0,

        highScore: 0,

        wins: 0,
        deaths: 0,
        bosses: 0,

        selectedCharacter: "pilot",

        ownedCharacters: ["pilot"],

        upgrades: {
            core: 0,
            score: 0,
            magnet: 0,
            shield: 0
        }

    };
}


export function register(username, password) {

    const users = getUsers();
    const key = username.toLowerCase();

    if (users[key]) {
        return {
            ok: false,
            message: "That username already exists."
        };
    }

    users[key] = createDefaultUser(
        username,
        password
    );

    saveUsers(users);
    setCurrentUser(key);

    return {
        ok: true,
        user: users[key]
    };
}


export function login(username, password) {

    const users = getUsers();
    const key = username.toLowerCase();

    if (!users[key]) {
        return {
            ok: false,
            message: "Account not found."
        };
    }

    if (users[key].password !== password) {
        return {
            ok: false,
            message: "Incorrect password."
        };
    }

    setCurrentUser(key);

    return {
        ok: true,
        user: users[key]
    };
}


export function logout() {
    clearCurrentUser();
}


export function updateCurrentUser(mutator) {

    const key = getCurrentUserKey();
    const users = getUsers();

    if (!key || !users[key]) {
        return null;
    }

    mutator(users[key]);

    saveUsers(users);

    return users[key];
}
