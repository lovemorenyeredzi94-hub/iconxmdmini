// FILE: commands/downloader/twitter.js
const { cmd } = require("../../arslan");
const axios = require("axios");

cmd({
    pattern: "twitter",
    alias: ["tw", "twdl", "x"],
    desc: "Download Twitter/X videos",
    category: "downloader",
    react: "🐦",
    filename: __filename
}, async (conn, mek, m, {
    reply, q
}) => {
    try {
        if (!q) return reply("❌ Please provide a Twitter/X video URL.\nExample: .twitter https://twitter.com/...");

        if (!q.includes('twitter.com') && !q.includes('x.com')) {
            return reply("❌ Please provide a valid Twitter/X URL.");
        }

        await reply("⏳ Downloading Twitter video...");

        const response = await axios.get(`https://api.twitter.com/1.1/statuses/show.json?id=${q.split('/status/')[1]?.split('?')[0]}`, {
            headers: {
                'Authorization': 'Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA'
            }
        });

        if (!response.data || !response.data.extended_entities) {
            return reply("❌ Failed to get Twitter video.");
        }

        const video = response.data.extended_entities.media[0];
        const videoUrl = video.video_info.variants[video.video_info.variants.length - 1].url;

        const videoData = await axios.get(videoUrl, { responseType: 'arraybuffer' });
        const buffer = Buffer.from(videoData.data);

        await conn.sendMessage(mek.key.remoteJid, {
            video: buffer,
            caption: `🐦 *TWITTER VIDEO*\n\n🔗 ${q}\n\nDownloaded by ICON-X MD`
        }, { quoted: mek });

    } catch (err) {
        console.error("Twitter Error:", err);
        reply("❌ Failed to download Twitter video. Please try again.");
    }
});