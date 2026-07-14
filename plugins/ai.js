const { cmd } = require("../arslan");
const APIs = require('../lib/api');

cmd({
    pattern: "ai",
    alias: ["gpt", "chatgpt", "ask"],
    desc: "Chat with AI (ChatGPT-style)",
    category: "ai",
    use: "ai <question>",
    react: "👑",
},
async(conn, mek, m, { from, reply, myquoted }) => {
    try {
      if (args.length === 0) {
        return extra.reply('❌ Usage: .ai <question>\n\nExample: .ai What is the capital of France?');
      }
      
      const question = args.join(' ');
      
      const response = await APIs.chatAI(question);
      
      // Send only the answer without labels
      const answer = response.response || response.msg || response.data?.msg || response;
      await extra.reply(answer);
      
    } catch (error) {
      await extra.reply(`❌ AI Error: ${error.message}`);
    }
  }
};
