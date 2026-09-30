import {
    getCurrentUser,
    updateCurrentUser
} from "./account.js";


export function xpNeeded(level) {

    return Math.floor(
        100 +
        (level - 1) * 75 +
        Math.pow(level - 1, 1.45) * 12
    );

}


export function gainXP(amount) {

    let leveled = false;

    const user = updateCurrentUser(user => {

        user.xp += amount;

        while (user.xp >= xpNeeded(user.level)) {

            user.xp -= xpNeeded(user.level);

            user.level++;

            leveled = true;

        }

    });

    return {
        user,
        leveled
    };

}


export function getProgress() {

    const user = getCurrentUser();

    if (!user) return null;

    return {

        level: user.level,

        xp: user.xp,

        required: xpNeeded(user.level),

        percentage:
            Math.min(
                100,
                user.xp / xpNeeded(user.level) * 100
            )

    };

}
