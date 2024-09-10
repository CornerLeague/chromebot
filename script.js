document.addEventListener("DOMContentLoaded", function () {
  const readAllBtn = document.getElementById("readAll");
  const summarizeBtn = document.getElementById("summarize");
  const voiceSelect = document.getElementById("voiceSelect");

  // Scrape and send the page text to ChatGPT for interpretation (iRead functionality)
  document.getElementById("iRead").addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        function: scrapeAndSendToChatGPT, // Scrape page content and send to ChatGPT
        args: [voiceSelect.value] // Pass the selected voice option
      });
    });
  });

  // Function to send the text content of the page to the ChatGPT backend and get an interpretation
  async function sendTextToChatGPT(text) {
    try {
      const response = await fetch('http://localhost:4000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: text }), // Send the scraped text to ChatGPT
      });

      const data = await response.json();
      return data.response; // Return the interpreted response from ChatGPT
    } catch (error) {
      console.error('Error:', error);
      return 'Error communicating with ChatGPT';
    }
  }

  // Function to scrape the visible text from the webpage and send it to ChatGPT for processing
  async function scrapeAndSendToChatGPT(voiceOption) {
    const webpageText = document.body.innerText; // Scrape the visible text
    const processedText = await sendTextToChatGPT(webpageText); // Send to ChatGPT
    readTextAloud(processedText, voiceOption); // Read the processed text aloud
  }

  // Function to read the text aloud using the Web Speech API
  function readTextAloud(text, voiceOption) {
    const utterance = new SpeechSynthesisUtterance(text); // Create a new speech utterance
    setVoice(utterance, voiceOption); // Set the selected voice option
    speechSynthesis.speak(utterance); // Speak the text
  }

  // Set the voice based on the user's selection
  function setVoice(utterance, voiceOption) {
    const voices = speechSynthesis.getVoices();
    if (voiceOption === 'voice1') {
      utterance.voice = voices.find(voice => voice.name === 'Google UK English Male');
    } else if (voiceOption === 'voice2') {
      utterance.voice = voices.find(voice => voice.name === 'Google UK English Female');
    }
  }

  // Summarize button - sends page text to ChatGPT for summarization
  summarizeBtn.addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        function: scrapeAndSendSummaryToChatGPT,
        args: [voiceSelect.value]
      });
    });
  });

  // Function to scrape and summarize the webpage using ChatGPT
  async function scrapeAndSendSummaryToChatGPT(voiceOption) {
    const webpageText = document.body.innerText; // Scrape the visible text
    const summaryText = await summarizeTextUsingChatGPT(webpageText); // Summarize the text
    readTextAloud(summaryText, voiceOption); // Read the summary aloud
  }

  // Function to send text to ChatGPT for summarization
  async function summarizeTextUsingChatGPT(text) {
    const response = await fetch('http://localhost:4000/summarize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text }) // Send the text to be summarized
    });

    const data = await response.json();
    return data.summary; // Return the summary
  }
});
