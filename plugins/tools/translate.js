const { cmd } = require('../arslan');
const axios = require('axios');

cmd({
    pattern: "translate",
    alias: ["tr", "t", "lang"],
    react: "🌐",
    desc: "Translate text to any language",
    category: "ai",
    use: ".translate en Hello world",
    filename: __filename
}, async (conn, mek, m, { from, reply, args }) => {
    try {
        if (args.length < 2) {
            return reply(`🌐 *TRANSLATOR*\n\nUsage: .translate <language> <text>\n\nExamples:\n.translate es Hello world\n.translate fr How are you?\n.translate ja Good morning\n\n📌 Language codes: en, es, fr, de, ja, zh, ar, ru, hi, it, pt, ko`);
        }

        const targetLang = args[0].toLowerCase();
        const text = args.slice(1).join(' ');

        if (!text) return reply("❌ Please provide text to translate!");

        await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });

        // Try multiple translation APIs
        let translated = null;
        let detectedLang = 'en';

        // API 1: LibreTranslate (Free)
        try {
            const res = await axios.post('https://api.cyberzone.tech/translate', {
                q: text,
                source: 'auto',
                target: targetLang
            }, { timeout: 10000 });
            if (res.data && res.data.translatedText) {
                translated = res.data.translatedText;
                detectedLang = res.data.detectedLanguage || 'auto';
            }
        } catch (e) {}

        // API 2: Google Translate via free API
        if (!translated) {
            try {
                const res = await axios.get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`, {
                    timeout: 10000
                });
                if (res.data && res.data[0] && res.data[0][0] && res.data[0][0][0]) {
                    translated = res.data[0][0][0];
                    detectedLang = res.data[2] || 'auto';
                }
            } catch (e) {}
        }

        // If translation failed
        if (!translated) {
            await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
            return reply(`❌ Failed to translate.\n\n💡 Tips:\n• Check language code\n• Try shorter text\n• Supported: en, es, fr, de, ja, zh, ar, ru, hi, it, pt, ko`);
        }

        await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });

        const langNames = {
            'en': 'English',
            'es': 'Spanish',
            'fr': 'French',
            'de': 'German',
            'ja': 'Japanese',
            'zh': 'Chinese',
            'ar': 'Arabic',
            'ru': 'Russian',
            'hi': 'Hindi',
            'it': 'Italian',
            'pt': 'Portuguese',
            'ko': 'Korean'
        };

        const targetName = langNames[targetLang] || targetLang.toUpperCase();
        const sourceName = langNames[detectedLang] || detectedLang.toUpperCase();

        reply(`🌐 *TRANSLATION*\n\n📝 *Original (${sourceName}):*\n${text}\n\n📝 *Translated (${targetName}):*\n${translated}\n\n📡 Powered by ICON-X MD AI`);

    } catch (error) {
        console.error("Translate error:", error);
        await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
        reply("❌ Translation failed. Please try again.");
    }
});