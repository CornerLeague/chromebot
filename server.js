const express = require('express');
const axios = require('axios');
const path = require('path');
require('dotenv').config();

const app = express();
const port = 3000;

app.use(express.json());

// Serve static files (CSS, JS, etc.)
app.use(express.static(path.join(__dirname, 'public')));

// Serve the HTML file when visiting the root ("/")
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// POST route for summarization
app.post('/summarize', async (req, res) => {
  const text = req.body.text;

  try {
    const response = await axios.post('https://api.openai.com/v1/completions', {
      model: 'text-davinci-003',
      prompt: `Summarize the following text:\n\n${text}`,
      max_tokens: 150
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    res.json({
      summary: response.data.choices[0].text.trim()
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error generating summary');
  }
});

app.listen(port, () => {
  console.log(`AI reader server running on http://localhost:${port}`);
});
