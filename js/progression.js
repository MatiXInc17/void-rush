// =====================================================
// VOID RUSH // PROGRESSION SYSTEM
// =====================================================

import {
    getCurrentUser,
    getUsers,
    saveUsers
} from "./account.js";


// =====================================================
// XP REQUIREMENT
// =====================================================

export function xpNeeded(level) {
    return Math.floor(
        100 +
        (level - 1) * 75 +
        Math.pow(level - 1, 1.45) * 12
    );
}


// =====================================================
// GET CURRENT PROGRESSION
// =====================================================

export function getProgression() {
    const user = getCurrentUser();

    if (!user) {
        return null;
    }

    return {
        level: user.level,
        xp: user.xp,
        required: xpNeeded(user.level)
    };
}


// =====================================================
// ADD XP
// =====================================================

export function gainXP(amount) {
    const username = localStorage.getItem(
        "voidRushCurrent"
    );

    if (!username) {
        return {
            gained: 0,
            levelsGained: 0,
            level: 1
        };
    }

    const users = getUsers();
    const user = users[username];

    if (!user) {
        return {
            gained: 0,
            levelsGained: 0,
            level: 1
        };
    }

    user.xp += Math.max(0, Math.floor(amount));

    let levelsGained = 0;

    while (user.xp >= xpNeeded(user.level)) {
        user.xp -= xpNeeded(user.level);

        user.level++;

        levelsGained++;
    }

    saveUsers(users);

    return {
        gained: Math.max(0, Math.floor(amount)),
        levelsGained,
        level: user.level,
        xp: user.xp,
        required: xpNeeded(user.level)
    };
}


// =====================================================
// SET XP
// =====================================================

export function setXP(amount) {
    const username = localStorage.getItem(
        "voidRushCurrent"
    );

    if (!username) {
        return null;
    }

    const users = getUsers();

    if (!users[username]) {
        return null;
    }

    users[username].xp = Math.max(
        0,
        Math.floor(amount)
    );

    saveUsers(users);

    return users[username];
}


// =====================================================
// SET LEVEL
// =====================================================

export function setLevel(level) {
    const username = localStorage.getItem(
        "voidRushCurrent"
    );

    if (!username) {
        return null;
    }

    const users = getUsers();

    if (!users[username]) {
        return null;
    }

    users[username].level = Math.max(
        1,
        Math.floor(level)
    );

    saveUsers(users);

    return users[username];
}


// =====================================================
// LEVEL PROGRESS
// =====================================================

export function getXPProgress() {
    const user = getCurrentUser();

    if (!user) {
        return {
            level: 1,
            xp: 0,
            required: xpNeeded(1),
            percent: 0
        };
    }

    const required = xpNeeded(user.level);

    return {
        level: user.level,
        xp: user.xp,
        required,

        percent: Math.min(
            100,
            (user.xp / required) * 100
        )
    };
}
