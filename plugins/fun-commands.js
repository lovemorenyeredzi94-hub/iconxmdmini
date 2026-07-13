const { cmd } = require('../arslan');

// ==================== RANDOM QUOTES ====================
cmd({
    pattern: "quote",
    alias: ["qoute", "inspire"],
    desc: "Get a random inspirational quote",
    category: "fun",
    react: "💭",
    filename: __filename
},
async (conn, mek, m, { reply }) => {
    try {
        const axios = require('axios');
        const response = await axios.get('https://api.quotable.io/random');
        
        const quote = response.data;
        reply(`💭 *INSPIRATIONAL QUOTE*\n\n"${quote.content}"\n\n— ${quote.author}\n\n> © ICON-X MD`);

    } catch (error) {
        console.error('Quote Error:', error);
        reply("❌ Failed to get quote.");
    }
});

// ==================== RANDOM JOKE ====================
cmd({
    pattern: "joke",
    alias: ["jokes", "funny"],
    desc: "Get a random joke",
    category: "fun",
    react: "😂",
    filename: __filename
},
async (conn, mek, m, { reply }) => {
    try {
        const axios = require('axios');
        const response = await axios.get('https://v2.jokeapi.dev/joke/Any?safe-mode');
        
        const data = response.data;
        
        if (data.type === 'single') {
            reply(`😂 *JOKE*\n\n${data.joke}\n\n> © ICON-X MD`);
        } else {
            reply(`😂 *JOKE*\n\n${data.setup}\n\n${data.delivery}\n\n> © ICON-X MD`);
        }

    } catch (error) {
        console.error('Joke Error:', error);
        reply("❌ Failed to get joke.");
    }
});

// ==================== RANDOM FACT ====================
cmd({
    pattern: "fact",
    alias: ["facts", "randomfact"],
    desc: "Get a random interesting fact",
    category: "fun",
    react: "🤯",
    filename: __filename
},
async (conn, mek, m, { reply }) => {
    try {
        const axios = require('axios');
        const response = await axios.get('https://uselessfacts.jsph.pl/random.json?language=en');
        
        const fact = response.data.text;
        reply(`🤯 *RANDOM FACT*\n\n${fact}\n\n> © ICON-X MD`);

    } catch (error) {
        console.error('Fact Error:', error);
        reply("❌ Failed to get fact.");
    }
});

// ==================== DICE ROLL ====================
cmd({
    pattern: "dice",
    alias: ["roll", "diceroll"],
    desc: "Roll a dice (1-6)",
    category: "fun",
    react: "🎲",
    filename: __filename
},
async (conn, mek, m, { reply }) => {
    try {
        const result = Math.floor(Math.random() * 6) + 1;
        const dice = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
        
        reply(`🎲 *DICE ROLL*\n\n${dice[result-1]} ${result}\n\n> © ICON-X MD`);

    } catch (error) {
        console.error('Dice Error:', error);
        reply("❌ Failed to roll dice.");
    }
});

// ==================== FLIP COIN ====================
cmd({
    pattern: "coin",
    alias: ["flip", "coinflip"],
    desc: "Flip a coin (Heads or Tails)",
    category: "fun",
    react: "🪙",
    filename: __filename
},
async (conn, mek, m, { reply }) => {
    try {
        const result = Math.random() < 0.5 ? 'Heads' : 'Tails';
        const emoji = result === 'Heads' ? '👤' : '🦊';
        
        reply(`🪙 *COIN FLIP*\n\n${emoji} ${result}\n\n> © ICON-X MD`);

    } catch (error) {
        console.error('Coin Error:', error);
        reply("❌ Failed to flip coin.");
    }
});