require('dotenv').config();
const axios = require('axios');
const express = require('express');
const cors = require('cors');
const path = require('path');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// API KEY Troubleshooting
if (!OPENAI_API_KEY) {
    console.error("API Key is not defined. Check your .env file.");
    process.exit(1);
}

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Handle frontend requests and backend logic
app.post('/process-code', async (req, res) => {
    const { code, language } = req.body;

    if (!code || !language) {
        return res.status(400).json({ error: "Code and language are required." });
    }

    try {
        const messages = [
            { role: 'system', content: 'You are an expert code optimizer and debugger.' },
            { role: 'user', content: `Optimize and debug this ${language} code:\n\n${code}` },
        ];

        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: 'gpt-3.5-turbo',
                messages,
                max_tokens: 2000,
                temperature: 0.5,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${OPENAI_API_KEY}`,
                },
            }
        );

        res.json({ optimizedCode: response.data.choices[0].message.content.trim() });
    } catch (error) {
        console.error("Error communicating with OpenAI API:", error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to process the code.' });
    }
});

// Fallback to serve the frontend
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
