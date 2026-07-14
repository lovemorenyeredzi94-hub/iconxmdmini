// FILE: commands/tools/mediafire.js
const { cmd } = require("../arslan");
const axios = require("axios");
const cheerio = require("cheerio");

cmd({
    pattern: "mediafire",
    alias: ["mf", "mediafiredl"],
    desc: "Download files from MediaFire",
    category: "tools",
    react: "📂",
    filename: __filename
}, async (conn, mek, m, {
    reply, q
}) => {
    try {
        if (!q) return reply("❌ Please provide a MediaFire file URL.\nExample: .mediafire https://www.mediafire.com/...");

        if (!q.includes('mediafire.com')) {
            return reply("❌ Please provide a valid MediaFire URL.");
        }

        await reply("⏳ Fetching MediaFire file...");

        const response = await axios.get(q);
        const $ = cheerio.load(response.data);
        
        const fileName = $('.filename').text().trim() || 'file';
        const downloadUrl = $('.download_link a').attr('href');
        
        if (!downloadUrl) {
            return reply("❌ Failed to get download link.");
        }

        const fileData = await axios.get(downloadUrl, { responseType: 'arraybuffer' });
        const buffer = Buffer.from(fileData.data);

        await conn.sendMessage(mek.key.remoteJid, {
            document: buffer,
            fileName: fileName,
            caption: `📂 *MEDIAFIRE FILE*\n\n📁 ${fileName}\n🔗 ${q}\n\nDownloaded by Arslan-MD`
        }, { quoted: mek });

    } catch (err) {
        console.error("MediaFire Error:", err);
        reply("❌ Failed to download MediaFire file. Please try again.");
    }
});