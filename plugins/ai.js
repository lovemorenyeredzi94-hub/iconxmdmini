const { cmd } = require('../arslan');
const axios = require('axios');

// AI API configurations
const AI_CONFIGS = {
    // Free OpenAI-like API (no key needed)
    openai: {
        url: 'https://api.openai.com/v1/chat/completions',
        key: process.env.OPENAI_API_KEY || 'YOUR_API_KEY',
        model: 'gpt-3.5-turbo'
    },
    // Free alternative (no key needed)
    gemini: {
        url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
        key: process.env.GEMINI_API_KEY || 'YOUR_API_KEY'
    },
    // Another free API (no key needed)
    blackbox: {
        url: 'https://api.blackbox.ai/api/chat',
        key: 'YOUR_API_KEY'
    }
};

// AI command with multiple modes
cmd({
    pattern: "ai",
    alias: ["gpt", "chat", "ask", "bot"],
    desc: "AI Chat - Ask anything!",
    category: "main",
    react: "🤖"
},
async(conn, mek, m, { args, reply, text, isGroup, sender, pushname }) => {
    if (!text) {
        return reply(`🤖 *AI CHAT COMMANDS*

Usage:
${m.prefix}ai <your question>
${m.prefix}gpt <your question>
${m.prefix}ask <your question>
${m.prefix}bot <your question>

Example:
${m.prefix}ai What is the meaning of life?

Commands:
➤ ai/gpt/ask/bot - Chat with AI
➤ aivision - AI with image analysis (coming soon)
➤ aivoice - AI voice response (coming soon)

✨ *Ask me anything!*`);
    }

    // Send typing indicator
    await conn.sendPresenceUpdate('composing', from);

    try {
        // Try different AI APIs in order
        let response = await tryBlackboxAI(text);
        
        if (!response) {
            response = await tryOpenAI(text);
        }
        
        if (!response) {
            response = await tryGeminiAI(text);
        }

        if (!response) {
            return reply("❌ All AI services are currently unavailable. Please try again later.");
        }

        // Format the response
        const formattedResponse = formatAIResponse(response, pushname || 'User');
        
        // Send the response
        await reply(formattedResponse);

    } catch (error) {
        console.error('AI Error:', error);
        reply(`❌ Error: ${error.message || 'Something went wrong'}`);
    }
});

// AI Image Analysis Command
cmd({
    pattern: "aivision",
    alias: ["vision", "imgai"],
    desc: "AI Image Analysis",
    category: "main",
    react: "👁️"
},
async(conn, mek, m, { reply, quoted }) => {
    // Check if there's an image
    const isImage = mek.message?.imageMessage || quoted?.message?.imageMessage;
    
    if (!isImage) {
        return reply(`👁️ *AI VISION*

Send an image with caption:
${m.prefix}aivision <question about image>

Example:
${m.prefix}aivision What's in this image?

*Or reply to an image with:*
${m.prefix}aivision Describe this image`);
    }

    try {
        await conn.sendPresenceUpdate('composing', from);
        
        // Get the image
        let imageMessage = isImage;
        let caption = mek.message?.imageMessage?.caption || quoted?.message?.imageMessage?.caption || 'Describe this image';
        
        // Download image
        const stream = await conn.downloadMediaMessage(imageMessage);
        const buffer = Buffer.from(await streamToBuffer(stream));
        
        // Convert to base64
        const base64Image = buffer.toString('base64');
        
        // Send to AI vision API
        const response = await analyzeImage(base64Image, caption);
        
        if (!response) {
            return reply("❌ Image analysis failed. Please try again.");
        }
        
        await reply(`👁️ *AI VISION ANALYSIS*\n\n${response}`);
        
    } catch (error) {
        console.error('AI Vision Error:', error);
        reply(`❌ Error: ${error.message || 'Something went wrong'}`);
    }
});

// AI Voice Command
cmd({
    pattern: "aivoice",
    alias: ["voiceai", "speak"],
    desc: "AI Voice Response",
    category: "main",
    react: "🔊"
},
async(conn, mek, m, { args, reply, text }) => {
    if (!text) {
        return reply(`🔊 *AI VOICE*

Send text to convert to speech:
${m.prefix}aivoice <text>

Example:
${m.prefix}aivoice Hello, how are you?`);
    }

    try {
        await conn.sendPresenceUpdate('composing', from);
        
        // Get AI response first
        let aiResponse = await tryBlackboxAI(text);
        if (!aiResponse) aiResponse = await tryOpenAI(text);
        if (!aiResponse) aiResponse = "I'm sorry, I couldn't process your request.";
        
        // Convert to speech (using free TTS API)
        const ttsUrl = `https://api.voicerss.org/?key=YOUR_API_KEY&hl=en-us&src=${encodeURIComponent(aiResponse)}`;
        
        // Download audio
        const audioBuffer = await axios.get(ttsUrl, { responseType: 'arraybuffer' });
        
        // Send audio
        await conn.sendMessage(from, {
            audio: Buffer.from(audioBuffer.data),
            mimetype: 'audio/mpeg',
            ptt: true
        }, { quoted: mek });
        
    } catch (error) {
        console.error('AI Voice Error:', error);
        reply(`❌ Error: ${error.message || 'Something went wrong'}`);
    }
});

// Helper Functions

// Try Blackbox AI (Free, no key needed)
async function tryBlackboxAI(text) {
    try {
        const response = await axios.post('https://api.blackbox.ai/api/chat', {
            messages: [
                {
                    id: "user",
                    role: "user",
                    content: text
                }
            ],
            model: "gpt-4o-mini",
            max_tokens: 1024,
            temperature: 0.7,
            top_p: 0.95,
            top_k: 40,
            repeat_penalty: 1.1,
            enabled_web_search: false,
            web_search_mode: "auto"
        }, {
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 30000
        });

        if (response.data && response.data.response) {
            return response.data.response;
        }
        return null;
    } catch (error) {
        console.error('Blackbox AI Error:', error.message);
        return null;
    }
}

// Try OpenAI API
async function tryOpenAI(text) {
    try {
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) return null;

        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: "You are a helpful WhatsApp assistant." },
                { role: "user", content: text }
            ],
            temperature: 0.7,
            max_tokens: 1000
        }, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            timeout: 30000
        });

        if (response.data && response.data.choices && response.data.choices[0]) {
            return response.data.choices[0].message.content;
        }
        return null;
    } catch (error) {
        console.error('OpenAI Error:', error.message);
        return null;
    }
}

// Try Gemini AI (Free)
async function tryGeminiAI(text) {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) return null;

        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
            {
                contents: [
                    {
                        parts: [
                            { text: text }
                        ]
                    }
                ]
            },
            {
                timeout: 30000
            }
        );

        if (response.data && response.data.candidates && response.data.candidates[0]) {
            return response.data.candidates[0].content.parts[0].text;
        }
        return null;
    } catch (error) {
        console.error('Gemini AI Error:', error.message);
        return null;
    }
}

// Try Ollama (Local AI)
async function tryOllamaAI(text) {
    try {
        const response = await axios.post('http://localhost:11434/api/generate', {
            model: "llama2",
            prompt: text,
            stream: false
        }, {
            timeout: 30000
        });

        if (response.data && response.data.response) {
            return response.data.response;
        }
        return null;
    } catch (error) {
        console.error('Ollama AI Error:', error.message);
        return null;
    }
}

// Image Analysis
async function analyzeImage(base64Image, text) {
    try {
        // Use free image analysis API
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: "gpt-4-vision-preview",
            messages: [
                {
                    role: "user",
                    content: [
                        { type: "text", text: text || "Describe this image" },
                        {
                            type: "image_url",
                            image_url: {
                                url: `data:image/jpeg;base64,${base64Image}`
                            }
                        }
                    ]
                }
            ],
            max_tokens: 300
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            },
            timeout: 30000
        });

        if (response.data && response.data.choices && response.data.choices[0]) {
            return response.data.choices[0].message.content;
        }
        return null;
    } catch (error) {
        console.error('Image Analysis Error:', error.message);
        return null;
    }
}

// Helper to convert stream to buffer
function streamToBuffer(stream) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        stream.on('data', (chunk) => chunks.push(chunk));
        stream.on('end', () => resolve(Buffer.concat(chunks)));
        stream.on('error', reject);
    });
}

// Format AI response for WhatsApp
function formatAIResponse(response, userName) {
    // Remove markdown and clean up
    let cleanResponse = response
        .replace(/\*\*(.*?)\*\*/g, '*$1*') // Keep bold but format for WhatsApp
        .replace(/\n{3,}/g, '\n\n') // Remove extra line breaks
        .trim();

    // Limit response length (WhatsApp has character limit)
    if (cleanResponse.length > 4000) {
        cleanResponse = cleanResponse.substring(0, 4000) + '\n\n... (truncated)';
    }

    return `🤖 *AI Assistant*\n\n${cleanResponse}\n\n✨ *Powered by AI*`;
}

// AI Chat History (optional - stores conversation)
const chatHistory = new Map();

cmd({
    pattern: "aichat",
    alias: ["chatgpt", "gptchat"],
    desc: "AI Chat with history",
    category: "main",
    react: "💬"
},
async(conn, mek, m, { args, reply, text, from }) => {
    if (!text) {
        return reply(`💬 *AI CHAT WITH HISTORY*

Start a conversation with AI that remembers context.

Commands:
${m.prefix}aichat <message> - Chat with AI
${m.prefix}aiclear - Clear chat history
${m.prefix}aistats - View chat stats

Example:
${m.prefix}aichat Hello, my name is John
${m.prefix}aichat What's my name? (AI remembers)`);
    }

    // Initialize history for this user
    if (!chatHistory.has(from)) {
        chatHistory.set(from, []);
    }

    const history = chatHistory.get(from);
    
    // Add user message to history
    history.push({ role: 'user', content: text });
    
    // Keep only last 10 messages to prevent token overflow
    if (history.length > 10) {
        history.shift();
    }

    try {
        await conn.sendPresenceUpdate('composing', from);
        
        // Get response with context
        const response = await tryBlackboxAIWithHistory(history);
        
        if (!response) {
            return reply("❌ AI service is currently unavailable. Please try again later.");
        }
        
        // Add AI response to history
        history.push({ role: 'assistant', content: response });
        
        await reply(`💬 *AI CHAT*\n\n${response}\n\n📝 *Chat History: ${history.length}/10 messages*`);
        
    } catch (error) {
        console.error('AI Chat Error:', error);
        reply(`❌ Error: ${error.message || 'Something went wrong'}`);
    }
});

// Clear chat history
cmd({
    pattern: "aiclear",
    alias: ["clearai", "resetai"],
    desc: "Clear AI chat history",
    category: "main",
    react: "🗑️"
},
async(conn, mek, m, { reply, from }) => {
    if (chatHistory.has(from)) {
        chatHistory.delete(from);
        reply("✅ *AI chat history cleared!*");
    } else {
        reply("ℹ️ *No chat history found.*");
    }
});

// AI Stats
cmd({
    pattern: "aistats",
    alias: ["aistatus", "aimode"],
    desc: "AI system status",
    category: "main",
    react: "📊"
},
async(conn, mek, m, { reply }) => {
    const status = await checkAIStatus();
    
    const stats = `📊 *AI SYSTEM STATUS*

🤖 *Blackbox AI:* ${status.blackbox ? '✅ Online' : '❌ Offline'}
🤖 *OpenAI:* ${status.openai ? '✅ Online' : '❌ Offline'}
🤖 *Gemini AI:* ${status.gemini ? '✅ Online' : '❌ Offline'}
🤖 *Ollama:* ${status.ollama ? '✅ Online' : '❌ Offline'}

💬 *Active Chats:* ${chatHistory.size}

✨ *All systems ready!*`;
    
    reply(stats);
});

// Check AI status
async function checkAIStatus() {
    const status = {
        blackbox: false,
        openai: false,
        gemini: false,
        ollama: false
    };

    try {
        // Test Blackbox
        const blackbox = await tryBlackboxAI('ping');
        status.blackbox = !!blackbox;
    } catch (e) {}

    try {
        // Test OpenAI
        const openai = await tryOpenAI('ping');
        status.openai = !!openai;
    } catch (e) {}

    try {
        // Test Gemini
        const gemini = await tryGeminiAI('ping');
        status.gemini = !!gemini;
    } catch (e) {}

    try {
        // Test Ollama
        const ollama = await tryOllamaAI('ping');
        status.ollama = !!ollama;
    } catch (e) {}

    return status;
}

// Try Blackbox AI with history
async function tryBlackboxAIWithHistory(history) {
    try {
        const messages = history.map(msg => ({
            id: msg.role === 'user' ? 'user' : 'assistant',
            role: msg.role,
            content: msg.content
        }));

        const response = await axios.post('https://api.blackbox.ai/api/chat', {
            messages: messages,
            model: "gpt-4o-mini",
            max_tokens: 1024,
            temperature: 0.7,
            top_p: 0.95,
            top_k: 40,
            repeat_penalty: 1.1,
            enabled_web_search: false,
            web_search_mode: "auto"
        }, {
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 30000
        });

        if (response.data && response.data.response) {
            return response.data.response;
        }
        return null;
    } catch (error) {
        console.error('Blackbox AI History Error:', error.message);
        return null;
    }
}
