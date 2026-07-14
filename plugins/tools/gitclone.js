// FILE: commands/tools/gitclone.js
const { cmd } = require("../arslan");
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

cmd({
    pattern: "gitclone",
    alias: ["clone", "git"],
    desc: "Clone a GitHub repository",
    category: "tools",
    react: "📦",
    filename: __filename
}, async (conn, mek, m, {
    reply, q
}) => {
    try {
        if (!q) return reply("❌ Please provide a GitHub repository URL.\nExample: .gitclone https://github.com/user/repo");

        if (!q.includes('github.com')) {
            return reply("❌ Please provide a valid GitHub URL.");
        }

        await reply("⏳ Cloning repository...");

        const repoName = q.split('/').pop().replace('.git', '');
        const cloneUrl = q.endsWith('.git') ? q : q + '.git';

        // Download repository as zip
        const downloadUrl = q.replace('github.com', 'github.com/') + '/archive/refs/heads/main.zip';
        
        const response = await axios.get(downloadUrl, { responseType: 'arraybuffer' });
        const buffer = Buffer.from(response.data);

        // Save zip file
        const zipPath = path.join(__dirname, '../../temp', `${repoName}.zip`);
        fs.ensureDirSync(path.join(__dirname, '../../temp'));
        fs.writeFileSync(zipPath, buffer);

        await conn.sendMessage(mek.key.remoteJid, {
            document: buffer,
            mimetype: "application/zip",
            fileName: `${repoName}.zip`,
            caption: `📦 *GITHUB REPOSITORY*\n\n📁 ${repoName}\n🔗 ${q}\n\nDownloaded by Arslan-MD`
        }, { quoted: mek });

        // Clean up
        setTimeout(() => {
            if (fs.existsSync(zipPath)) fs.removeSync(zipPath);
        }, 60000);

    } catch (err) {
        console.error("GitClone Error:", err);
        reply("❌ Failed to clone repository. Please make sure the URL is correct.");
    }
});