const express = require('express');
const axios = require('axios');
const path = require('path');
require('dotenv').config();

const app = express();
const port = 4000;

app.use(express.json());

// Serve static files (CSS, JS, etc.)
app.use(express.static(path.join(__dirname, 'public')));

// Serve the HTML file when visiting the root ("/")
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});


// POST route for summarization
app.post('/summarize', async (req, res) => {
  const { text } = req.body;

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

    const summary = response.data.choices[0].text.trim();
    res.json({ summary });
  } catch (error) {
    console.error('Error with OpenAI API:', error.response ? error.response.data : error.message);
    res.status(500).send('Error generating summary');
  }
});

// POST route for recommendations
app.post('/recommendations', async (req, res) => {
  const { text } = req.body;

  try {
    const response = await axios.post('https://api.openai.com/v1/completions', {
      model: 'text-davinci-003',
      prompt: `Based on the following text, provide related links and articles:\n\n${text}`,
      max_tokens: 150
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    // Example structure of how you might receive and parse recommendations
    const recommendations = response.data.choices[0].text.trim().split('\n').map(item => {
      return {
        title: item,  // Use the item as the title, this can be customized
        url: `https://www.google.com/search?q=${encodeURIComponent(item)}`  // Example: using Google Search as a placeholder for URLs
      };
    });

    res.json({ recommendations });
  } catch (error) {
    console.error('Error with OpenAI API:', error.response ? error.response.data : error.message);
    res.status(500).send('Error generating recommendations');
  }
});

// POST route for ChatGPT response (general chat interaction)
app.post('/chat', async (req, res) => {
  const { prompt } = req.body;

  try {
    const response = await axios.post('https://api.openai.com/v1/completions', {
      model: 'text-davinci-003',
      prompt: prompt,  // Use the prompt sent from the client-side
      max_tokens: 150,
      temperature: 0.7 
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const chatResponse = response.data.choices[0].text.trim();
    res.json({ response: chatResponse });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error generating ChatGPT response');
  }
});

app.listen(port, () => {
  console.log(`AI reader server running on http://localhost:${port}`);
});
