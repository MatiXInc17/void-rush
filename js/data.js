```js
// =====================================================
// VOID RUSH // STATIC GAME DATA
// =====================================================


// =====================================================
// CHARACTERS
// =====================================================

export const CHARACTERS = {
    pilot: {
        name: "PILOT",
        icon: "🚀",
        description: "Balanced and reliable.",
        speed: 5.5,
        size: 18,
        luck: 1,
        cost: 0
    },

    comet: {
        name: "COMET",
        icon: "☄️",
        description: "Extremely fast. Slightly fragile.",
        speed: 7,
        size: 15,
        luck: 0.8,
        cost: 500
    },

    void: {
        name: "VOID",
        icon: "🕳️",
        description: "Small hitbox. Excellent control.",
        speed: 5,
        size: 12,
        luck: 1.2,
        cost: 1200
    },

    quantum: {
        name: "QUANTUM",
        icon: "⚛️",
        description: "Lucky enough to break probability.",
        speed: 5.2,
        size: 17,
        luck: 1.7,
        cost: 2500
    }
};


// =====================================================
// SHOP
// =====================================================

export const SHOP = {
    core: {
        name: "EXTRA CORE",
        icon: "❤️",
        description: "Start each run with an additional life.",
        base: 600
    },

    score: {
        name: "SCORE ENGINE",
        icon: "🔥",
        description: "Increase score gained from everything.",
        base: 700
    },

    magnet: {
        name: "PROBABILITY DRIVE",
        icon: "🧲",
        description: "Energy orbs are attracted toward you.",
        base: 900
    },

    shield: {
        name: "PHASE SHIELD",
        icon: "🛡️",
        description: "Occasionally prevents a collision.",
        base: 1200
    }
};


// =====================================================
// LEVELS
// =====================================================

export const LEVELS = [
    {
        name: "AWAKENING",
        distance: 1800,
        speed: 1,
        color: "#52f6ff",
        boss: false
    },

    {
        name: "DEEP SPACE",
        distance: 2400,
        speed: 1.25,
        color: "#9b6cff",
        boss: false
    },

    {
        name: "GRAVITY WELL",
        distance: 2900,
        speed: 1.45,
        color: "#ff4fd8",
        boss: true,
        bossType: "blackhole"
    },

    {
        name: "ANTIMATTER",
        distance: 3400,
        speed: 1.65,
        color: "#ff5277",
        boss: false
    },

    {
        name: "CAT STATE",
        distance: 3900,
        speed: 1.85,
        color: "#ffe66d",
        boss: true,
        bossType: "cat"
    },

    {
        name: "EVENT HORIZON",
        distance: 4500,
        speed: 2.1,
        color: "#59ff9a",
        boss: false
    },

    {
        name: "QUANTUM COLLAPSE",
        distance: 5200,
        speed: 2.4,
        color: "#52f6ff",
        boss: true,
        bossType: "quantum"
    },

    {
        name: "THE VOID",
        distance: 6000,
        speed: 2.7,
        color: "#ff4fd8",
        boss: true,
        bossType: "void"
    }
];


// =====================================================
// LEVEL-UP UPGRADES
// =====================================================

export const UPGRADES = [
    {
        icon: "⚡",
        name: "OVERDRIVE",
        description: "+12% movement speed.",
        apply: player => {
            player.speed *= 1.12;
        }
    },

    {
        icon: "🔥",
        name: "AMPLIFIER",
        description: "+20% score multiplier.",
        apply: player => {
            player.scoreMult *= 1.2;
        }
    },

    {
        icon: "❤️",
        name: "REINFORCED CORE",
        description: "+1 maximum life and heal 1.",
        apply: player => {
            player.maxLives++;
            player.lives++;
        }
    },

    {
        icon: "🧲",
        name: "MAGNETISM",
        description: "Stronger orb attraction.",
        apply: player => {
            player.magnet += 45;
        }
    },

    {
        icon: "🍀",
        name: "LUCK",
        description: "+25% chance for bonus rewards.",
        apply: player => {
            player.luck += 0.25;
        }
    },

    {
        icon: "🛡️",
        name: "PHASE ARMOR",
        description: "Reduces collision damage.",
        apply: player => {
            player.armor++;
        }
    }
];
```
