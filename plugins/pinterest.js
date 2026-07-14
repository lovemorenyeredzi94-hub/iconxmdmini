const { cmd } = require('../arslan');
const axios = require('axios');

cmd({
    pattern: "pinterest",
    alias: ["pin", "pindl", "pinimg"],
    react: "📌",
    desc: "Download Pinterest images",
    category: "download",
    use: ".pinterest image name",
    filename: __filename
}, async (conn, mek, m, { from, reply, q }) => {
    try {
        if (!q) {
            return reply(`📌 *PINTEREST DOWNLOADER*\n\nDownload images from Pinterest!\nExample: .pinterest nature wallpaper\n\n💡 Supports:\n• Image search\n• Direct URLs\n• Popular images`);
        }

        await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });

        let imageUrl = null;

        // Try multiple APIs
        try {
            const res = await axios.get(`https://api.cyberzone.tech/pinterest?q=${encodeURIComponent(q)}`, {
                timeout: 15000
            });
            if (res.data && res.data.url) {
                imageUrl = res.data.url;
            }
        } catch (e) {}

        if (!imageUrl) {
            // Fallback: Use Google Images via simple search
            try {
                const res = await axios.get(`https://api.unsplash.com/photos/random?query=${encodeURIComponent(q)}&client_id=YOUR_UNSPLASH_KEY`, {
                    timeout: 10000
                });
                if (res.data && res.data.urls && res.data.urls.regular) {
                    imageUrl = res.data.urls.regular;
                }
            } catch (e) {}
        }

        if (!imageUrl) {
            await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
            return reply(`❌ No images found for: *${q}*\n\n💡 Tips:\n• Try different keywords\n• Use specific terms\n• Check spelling`);
        }

        // Send image
        await conn.sendMessage(from, {
            image: { url: imageUrl },
            caption: `📌 *Pinterest Image*\n\n📝 *Search:* ${q}\n✅ Downloaded successfully!`
        }, { quoted: m });

        await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });

    } catch (error) {
        console.error("Pinterest error:", error);
        await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
        reply("❌ Failed to download Pinterest image.");
    }
});