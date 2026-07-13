const express = require('express');
const app = express();
const port = process.env.PORT || 8000;
const bodyParser = require('body-parser');
const cors = require('cors');

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const pairRouter = require('./main');
app.use('/', pairRouter);

// ============ KEEP ALIVE (AUTO 24/7) ============

// Simple status endpoint for Render
app.get('/', (req, res) => {
    res.send('🤖 Bot is alive!');
});

// Auto self-ping every 4 minutes to prevent sleep
setInterval(() => {
    const url = process.env.RENDER_URL || `http://localhost:${port}`;
    fetch(url)
        .then(() => console.log('🔄 Self-ping at', new Date().toISOString()))
        .catch(() => console.log('⚠️ Self-ping failed'));
}, 240000); // 4 minutes

// Log alive status every minute
setInterval(() => {
    console.log('💚 Bot alive at', new Date().toISOString());
}, 60000);

// ============ START SERVER ============

app.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
    console.log('💚 Auto keep-alive is ACTIVE');
});

module.exports = app;
