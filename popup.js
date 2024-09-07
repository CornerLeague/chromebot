document.addEventListener("DOMContentLoaded", function () {
    const readAllBtn = document.getElementById("readAll");
    const summarizeBtn = document.getElementById("summarize");
    const voiceSelect = document.getElementById("voiceSelect");
  


    document.getElementById("summarize").addEventListener("click", async () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            function: getPageText, // Function to get text from the page
          }, async (results) => {
            const pageText = results[0].result;
            const summary = await summarizeText(pageText);
            alert("Summary: " + summary); // Or display it in the UI
          });
        });
      });
      
      async function summarizeText(text) {
        const response = await fetch('http://localhost:3000/summarize', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ text })
        });
      
        const data = await response.json();
        return data.summary;
      }
      
      function getPageText() {
        return document.body.innerText; // Extracts all text on the page
      }

      
    // Read the entire page
    readAllBtn.addEventListener("click", () => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          function: readPageContent,
          args: [voiceSelect.value]
        });
      });
    });
  
    // Summarize the page
    summarizeBtn.addEventListener("click", () => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          function: summarizePageContent,
          args: [voiceSelect.value]
        });
      });
    });
  });
  
  // Function to read the entire page
  function readPageContent(voiceOption) {
    const utterance = new SpeechSynthesisUtterance(document.body.innerText);
    setVoice(utterance, voiceOption);
    speechSynthesis.speak(utterance);
  }
  
  // Function to summarize the page content
  function summarizePageContent(voiceOption) {
    const text = document.body.innerText;
    const summary = summarizeText(text); // Basic summarization
    const utterance = new SpeechSynthesisUtterance(summary);
    setVoice(utterance, voiceOption);
    speechSynthesis.speak(utterance);
  }
  
  // Simple text summarizer (basic)
  function summarizeText(text) {
    const sentences = text.split('. ');
    const summary = sentences.slice(0, 5).join('. ') + '.';
    return summary;
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
  