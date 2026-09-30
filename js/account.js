```js
// =====================================================
// VOID RUSH // ACCOUNT SYSTEM
// =====================================================


// =====================================================
// STORAGE KEYS
// =====================================================

const USERS_KEY = "voidRushUsers";
const CURRENT_USER_KEY = "voidRushCurrent";


// =====================================================
// USER STORAGE
// =====================================================

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


// =====================================================
// DEFAULT USER
// =====================================================

export function defaultUser(username, password) {
    return {
        username,
        password,

        created: Date.now(),

        level: 1,
        xp: 0,

        coins: 0,

        highScore: 0,
        wins: 0,
        deaths: 0,
        bosses: 0,

        selectedCharacter: "pilot",

        ownedCharacters: [
            "pilot"
        ],

        upgrades: {
            core: 0,
            score: 0,
            magnet: 0,
            shield: 0
        }
    };
}


// =====================================================
// CURRENT USER
// =====================================================

export function getCurrentUsername() {
    return localStorage.getItem(
        CURRENT_USER_KEY
    );
}


export function setCurrentUsername(username) {
    localStorage.setItem(
        CURRENT_USER_KEY,
        username
    );
}


export function clearCurrentUser() {
    localStorage.removeItem(
        CURRENT_USER_KEY
    );
}


export function getCurrentUser() {
    const username = getCurrentUsername();

    if (!username) {
        return null;
    }

    const users = getUsers();

    return users[username] || null;
}


// =====================================================
// UPDATE CURRENT USER
// =====================================================

export function updateCurrentUser(updates) {
    const username = getCurrentUsername();

    if (!username) {
        return null;
    }

    const users = getUsers();

    if (!users[username]) {
        return null;
    }

    users[username] = {
        ...users[username],
        ...updates
    };

    saveUsers(users);

    return users[username];
}


// =====================================================
// CREATE ACCOUNT
// =====================================================

export function registerUser(username, password) {
    const users = getUsers();

    if (users[username]) {
        return {
            success: false,
            message: "USERNAME ALREADY EXISTS."
        };
    }

    const user = defaultUser(
        username,
        password
    );

    users[username] = user;

    saveUsers(users);

    setCurrentUsername(username);

    return {
        success: true,
        user
    };
}


// =====================================================
// LOGIN
// =====================================================

export function loginUser(username, password) {
    const users = getUsers();

    const user = users[username];

    if (!user) {
        return {
            success: false,
            message: "ACCOUNT NOT FOUND."
        };
    }

    if (user.password !== password) {
        return {
            success: false,
            message: "INCORRECT PASSWORD."
        };
    }

    setCurrentUsername(username);

    return {
        success: true,
        user
    };
}


// =====================================================
// LOGOUT
// =====================================================

export function logoutUser() {
    clearCurrentUser();
}


// =====================================================
// AUTH CHECK
// =====================================================

export function isLoggedIn() {
    return getCurrentUser() !== null;
}


// =====================================================
// REQUIRE LOGIN
// =====================================================

export function requireLogin() {
    const user = getCurrentUser();

    if (!user) {
        return false;
    }

    return true;
}
```
