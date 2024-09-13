const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const OpenAI = require('openai');
require('dotenv').config();

// Initialize the OpenAI client with your API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // API key from .env file
});

const app = express();
const port = 4000;

app.use(express.json());
app.use(bodyParser.json());

// Serve static files (CSS, JS, etc.)
app.use(express.static(path.join(__dirname, 'public')));

// Serve the HTML file when visiting the root ("/")
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'popup.html'));
});

// POST route for summarization
app.post('/summarize', async (req, res) => {
  const { text } = req.body;

  try {
    // Make API request to OpenAI using their official SDK
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',  // Use GPT-4 or GPT-3.5 based on your subscription
      messages: [
        { "role": "user", "content": `Summarize the following text:\n\n${text}` }
      ],
      max_tokens: 150
    });

    // Extract and send the summary response
    const summary = completion.choices[0].message.content.trim();
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
    // Make API request to OpenAI for recommendations
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',  // Use GPT-4 or GPT-3.5 based on your subscription
      messages: [
        { "role": "user", "content": `Based on the following text, provide related links and articles:\n\n${text}` }
      ],
      max_tokens: 150
    });

    // Example structure of how you might receive and parse recommendations
    const recommendations = completion.choices[0].message.content.trim().split('\n').map(item => {
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
    // Make API request to OpenAI using their official SDK
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',  // Use GPT-4 or GPT-3.5 based on your subscription
      messages: [
        { "role": "user", "content": prompt }
      ],
      max_tokens: 150,
      temperature: 0.7
    });

    const chatResponse = completion.choices[0].message.content.trim();
    res.json({ response: chatResponse });
  } catch (error) {
    console.error('Error with OpenAI API:', error.response ? error.response.data : error.message);
    res.status(500).send('Error generating ChatGPT response');
  }
});

app.listen(port, () => {
  console.log(`AI reader server running on http://localhost:${port}`);
});

