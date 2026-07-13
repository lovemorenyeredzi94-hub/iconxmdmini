// FILE: commands/tools/dictionary.js
const { cmd } = require("../../arslan");
const axios = require("axios");

cmd({
    pattern: "define",
    alias: ["dictionary", "meaning", "dict"],
    desc: "Get word definition",
    category: "tools",
    react: "📖",
    filename: __filename
}, async (conn, mek, m, {
    reply, q
}) => {
    try {
        if (!q) return reply("❌ Please provide a word to define.\nExample: .define hello");

        const response = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(q)}`);

        if (!response.data || response.data.title === "No Definitions Found") {
            return reply(`❌ No definition found for "${q}".`);
        }

        const data = response.data[0];
        const word = data.word;
        const phonetic = data.phonetic || '';
        const meanings = data.meanings;

        let text = `📖 *DICTIONARY*\n\n`;
        text += `📝 *Word:* ${word}\n`;
        if (phonetic) text += `🔊 *Phonetic:* ${phonetic}\n\n`;

        meanings.slice(0, 3).forEach((meaning, i) => {
            text += `*${meaning.partOfSpeech}*\n`;
            meaning.definitions.slice(0, 2).forEach((def, j) => {
                text += `${i+1}.${j+1} ${def.definition}\n`;
            });
            if (meaning.synonyms && meaning.synonyms.length > 0) {
                text += `🔁 *Synonyms:* ${meaning.synonyms.slice(0, 5).join(', ')}\n`;
            }
            text += '\n';
        });

        await conn.sendMessage(mek.key.remoteJid, {
            text: text,
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true
            }
        }, { quoted: mek });

    } catch (err) {
        console.error("Dictionary Error:", err);
        reply(`❌ No definition found for "${q}".`);
    }
});

cmd({
    pattern: "translate",
    alias: ["tr", "trans"],
    desc: "Translate text to another language",
    category: "tools",
    react: "🌐",
    filename: __filename
}, async (conn, mek, m, {
    reply, args
}) => {
    try {
        if (args.length < 2) {
            return reply("❌ Usage: .translate <language> <text>\nExample: .translate fr Hello world");
        }

        const lang = args[0];
        const text = args.slice(1).join(' ');

        const response = await axios.get(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${lang}`);

        if (!response.data || !response.data.responseData) {
            return reply("❌ Translation failed.");
        }

        const translatedText = response.data.responseData.translatedText;

        await conn.sendMessage(mek.key.remoteJid, {
            text: `🌐 *TRANSLATION*\n\n📝 Original: ${text}\n🌍 Language: ${lang.toUpperCase()}\n📋 Translation: ${translatedText}`,
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true
            }
        }, { quoted: mek });

    } catch (err) {
        console.error("Translate Error:", err);
        reply("❌ Translation failed. Please try again.");
    }
});