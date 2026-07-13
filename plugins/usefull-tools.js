const { cmd } = require('../arslan');

// ==================== URL SHORTENER ====================
cmd({
    pattern: "short",
    alias: ["shorten", "tinyurl"],
    desc: "Shorten a URL",
    category: "tools",
    react: "🔗",
    filename: __filename
},
async (conn, mek, m, { q, reply }) => {
    try {
        if (!q) return reply("❌ Please provide a URL to shorten!\nExample: .short https://example.com");

        const axios = require('axios');
        const response = await axios.get(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(q)}`);
        
        if (response.data) {
            reply(`🔗 *Shortened URL*\n\nOriginal: ${q}\nShort: ${response.data}\n\n> © ICON-X MD`);
        } else {
            reply("❌ Failed to shorten URL. Please try again.");
        }
    } catch (error) {
        console.error('Short URL Error:', error);
        reply("❌ Error shortening URL.");
    }
});

// ==================== QR CODE GENERATOR ====================
cmd({
    pattern: "qr",
    alias: ["qrcode", "qrgen"],
    desc: "Generate QR Code for text or URL",
    category: "tools",
    react: "📱",
    filename: __filename
},
async (conn, mek, m, { q, reply, from }) => {
    try {
        if (!q) return reply("❌ Please provide text or URL to generate QR!\nExample: .qr Hello World");

        const axios = require('axios');
        const apiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(q)}`;
        
        await conn.sendMessage(from, {
            image: { url: apiUrl },
            caption: `📱 *QR CODE*\n\nData: ${q}\n\n> © ICON-X MD`
        }, { quoted: mek });

    } catch (error) {
        console.error('QR Error:', error);
        reply("❌ Failed to generate QR Code.");
    }
});

// ==================== WEATHER ====================
cmd({
    pattern: "weather",
    alias: ["temp", "weatherinfo"],
    desc: "Get weather information for a city",
    category: "tools",
    react: "🌤️",
    filename: __filename
},
async (conn, mek, m, { q, reply }) => {
    try {
        if (!q) return reply("❌ Please provide a city name!\nExample: .weather Lahore");

        const axios = require('axios');
        const apiKey = process.env.WEATHER_API_KEY || 'your_api_key_here';
        const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(q)}&appid=${apiKey}&units=metric`);
        
        const data = response.data;
        const weather = `
🌤️ *WEATHER INFORMATION*

📍 City: ${data.name}, ${data.sys.country}
🌡️ Temperature: ${data.main.temp}°C
🤔 Feels Like: ${data.main.feels_like}°C
💧 Humidity: ${data.main.humidity}%
💨 Wind: ${data.wind.speed} m/s
☁️ Condition: ${data.weather[0].description}
🌅 Sunrise: ${new Date(data.sys.sunrise * 1000).toLocaleTimeString()}
🌇 Sunset: ${new Date(data.sys.sunset * 1000).toLocaleTimeString()}

> © ICON-X MD`;

        reply(weather);

    } catch (error) {
        console.error('Weather Error:', error);
        reply("❌ Failed to get weather information. Please check city name.");
    }
});

// ==================== CALCULATOR ====================
cmd({
    pattern: "calc",
    alias: ["calculate", "math"],
    desc: "Perform mathematical calculations",
    category: "tools",
    react: "🧮",
    filename: __filename
},
async (conn, mek, m, { q, reply }) => {
    try {
        if (!q) return reply("❌ Please provide a calculation!\nExample: .calc 2+2");

        // Sanitize input (allow only numbers, operators, parentheses, and spaces)
        const sanitized = q.replace(/[^0-9+\-*/().%^ ]/g, '');
        
        if (!sanitized) return reply("❌ Invalid expression!");

        // Function to safely evaluate
        const result = Function(`"use strict"; return (${sanitized})`)();
        
        if (isNaN(result)) return reply("❌ Invalid calculation!");

        reply(`🧮 *CALCULATION*

${sanitized} = ${result}

> © ICON-X MD`);

    } catch (error) {
        console.error('Calc Error:', error);
        reply("❌ Invalid calculation. Please use: + - * / ( )");
    }
});

// ==================== BASE64 ====================
cmd({
    pattern: "base64",
    alias: ["b64", "encode64"],
    desc: "Encode or decode Base64",
    category: "tools",
    react: "🔐",
    filename: __filename
},
async (conn, mek, m, { args, q, reply }) => {
    try {
        const action = args[0]?.toLowerCase();
        const text = args.slice(1).join(' ');

        if (!action || !text) {
            return reply(`🔐 *BASE64 TOOL*

Usage:
.base64 encode <text> - Encode text to Base64
.base64 decode <base64> - Decode Base64 to text

Example:
.base64 encode Hello World
.base64 decode SGVsbG8gV29ybGQ=

> © ICON-X MD`);
        }

        if (action === 'encode') {
            const encoded = Buffer.from(text).toString('base64');
            reply(`🔐 *ENCODED*\n\nOriginal: ${text}\nBase64: ${encoded}`);
        } else if (action === 'decode') {
            const decoded = Buffer.from(text, 'base64').toString('utf8');
            reply(`🔐 *DECODED*\n\nBase64: ${text}\nOriginal: ${decoded}`);
        } else {
            reply("❌ Invalid action! Use 'encode' or 'decode'");
        }

    } catch (error) {
        console.error('Base64 Error:', error);
        reply("❌ Failed to encode/decode. Please check your input.");
    }
});

// ==================== RANDOM PASSWORD ====================
cmd({
    pattern: "password",
    alias: ["pass", "genpass", "randompass"],
    desc: "Generate a random password",
    category: "tools",
    react: "🔑",
    filename: __filename
},
async (conn, mek, m, { args, reply }) => {
    try {
        const length = parseInt(args[0]) || 12;
        
        if (length < 4 || length > 64) {
            return reply("❌ Password length must be between 4 and 64!");
        }

        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=';
        let password = '';
        
        for (let i = 0; i < length; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }

        reply(`🔑 *RANDOM PASSWORD*

Password: ${password}
Length: ${length}

> © ICON-X MD`);

    } catch (error) {
        console.error('Password Error:', error);
        reply("❌ Failed to generate password.");
    }
});