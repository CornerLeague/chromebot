let speechSynthesisUtterance;
let isPlaying = false;
let summaryText = '';  // Variable to hold the summarized text

// Function to show the main buttons and hide the Start button
document.getElementById('startBtn').addEventListener('click', () => {
  document.getElementById('startBtn').style.display = 'none';  // Hide the Start button
  document.getElementById('mainButtons').style.display = 'block';  // Show the main buttons
});

// Function to scrape the visible text from the webpage
function scrapeWebpageText() {
  return document.body.innerText;  // Extract the visible text from the webpage
}

// Function to toggle play/pause of speech synthesis
function togglePlayPause() {
  const playPauseIcon = document.getElementById('playPauseIcon');

  if (isPlaying) {
    window.speechSynthesis.pause();
    playPauseIcon.src = "/icon/1.png";  // Change icon to play (1.png)
    isPlaying = false;
  } else {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    } else {
      const textToRead = summaryText || scrapeWebpageText();  // Use the summary text if available, otherwise scrape the webpage
      speechSynthesisUtterance = new SpeechSynthesisUtterance(textToRead);

      // Set Antoni (Legacy) as the voice, if available
      const voices = window.speechSynthesis.getVoices();
      const antoniVoice = voices.find(voice => voice.name === 'Antoni (Legacy)');
      speechSynthesisUtterance.voice = antoniVoice || voices[0];

      speechSynthesisUtterance.rate = 1;  // Normal speed
      speechSynthesisUtterance.pitch = 1;  // Normal pitch
      speechSynthesisUtterance.volume = 1;  // Normal volume

      // Event listener when the speech ends
      speechSynthesisUtterance.onend = () => {
        playPauseIcon.src = "/icon/1.png";  // Change icon back to play (1.png)
        isPlaying = false;
      };

      window.speechSynthesis.speak(speechSynthesisUtterance);
    }
    playPauseIcon.src = "/icon/2.png";  // Change icon to pause (2.png)
    isPlaying = true;
  }
}

// Event listener for the iRead button
document.getElementById('iRead').addEventListener('click', togglePlayPause);

// Function to clear all action content when a new button is clicked
function clearPreviousActions() {
  document.getElementById('summaryContainer').style.display = 'none';  // Hide the summary container
  document.getElementById('summaryText').innerText = '';  // Clear the summary text
  document.getElementById('simplerBtnContainer').style.display = 'none';  // Hide the Simpler button
  document.getElementById('inDepthBtnContainer').style.display = 'none';  // Hide the In-Depth button
  document.getElementById('recommendationsContainer').style.display = 'none';  // Hide the recommendations container
  document.getElementById('recommendationsList').innerHTML = '';  // Clear the recommendations list
  document.getElementById('filterButtons').style.display = 'none';  // Hide the filter buttons
}

// Remaining functions and event listeners as before...


// Function to send the scraped text to the ChatGPT API for summarization
async function sendTextToChatGPT(prompt, text) {
  try {
    const response = await fetch('http://localhost:4000/summarize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ prompt: `${prompt}\n\n${text}` })  // Send the scraped text and the prompt to the backend
    });
    const data = await response.json();
    return data.summary;  // Return the summarized text
  } catch (error) {
    console.error('Error communicating with ChatGPT:', error);
    return 'Error generating summary.';
  }
}

// Event listener for the iSummarize button
document.getElementById('iSummarize').addEventListener('click', async () => {
  clearPreviousActions();  // Clear previous actions when iSummarize is clicked
  const scrapedText = scrapeWebpageText();  // Scrape the visible text from the webpage
  summaryText = await sendTextToChatGPT("Summarize the content", scrapedText);  // Send it to ChatGPT for summarization
  
  // Display the summary on the screen
  document.getElementById('summaryText').innerText = summaryText;
  document.getElementById('summaryContainer').style.display = 'block';  // Show the summary container
  document.getElementById('simplerBtnContainer').style.display = 'block';  // Show the Simpler button
  document.getElementById('inDepthBtnContainer').style.display = 'block';  // Show the In-Depth button
});

// Event listener for the Simpler button
document.getElementById('simplerBtn').addEventListener('click', async () => {
  const scrapedText = scrapeWebpageText();  // Scrape the visible text from the webpage
  const summary = await sendTextToChatGPT("Please provide a simpler, easy-to-understand summary", scrapedText);
  
  // Display the simpler summary
  document.getElementById('summaryText').innerText = summary;
  document.getElementById('summaryContainer').style.display = 'block';  // Show the summary container
});

// Event listener for the In-Depth button
document.getElementById('inDepthBtn').addEventListener('click', async () => {
  const scrapedText = scrapeWebpageText();  // Scrape the visible text from the webpage
  const summary = await sendTextToChatGPT("Please provide a more detailed and intellectual summary", scrapedText);
  
  // Display the in-depth summary
  document.getElementById('summaryText').innerText = summary;
  document.getElementById('summaryContainer').style.display = 'block';  // Show the summary container
});

// Event listener for the iRecommend button
document.getElementById('iRecommend').addEventListener('click', () => {
  clearPreviousActions();  // Clear previous actions when iRecommend is clicked
  document.getElementById('filterButtons').style.display = 'block';  // Show the filter buttons
});

// Event listener for the "Most Recent" button
document.getElementById('mostRecentBtn').addEventListener('click', async () => {
  const scrapedText = scrapeWebpageText();  // Scrape the visible text from the webpage
  const recommendations = await sendTextToChatGPT("Provide the most recent articles or updates", scrapedText);

  // Display the recommendations on the screen
  displayRecommendations(recommendations);
  document.getElementById('recommendationsContainer').style.display = 'block';  // Show the recommendations container
  document.getElementById('filterButtons').style.display = 'none';  // Hide the filter buttons
});

// Event listener for the "Most Popular" button
document.getElementById('mostPopularBtn').addEventListener('click', async () => {
  const scrapedText = scrapeWebpageText();  // Scrape the visible text from the webpage
  const recommendations = await sendTextToChatGPT("Provide the highest ranked articles or webpages", scrapedText);

  // Display the recommendations on the screen
  displayRecommendations(recommendations);
  document.getElementById('recommendationsContainer').style.display = 'block';  // Show the recommendations container
  document.getElementById('filterButtons').style.display = 'none';  // Hide the filter buttons
});

// Function to display recommendations
function displayRecommendations(recommendations) {
  const recommendationsList = document.getElementById('recommendationsList');
  recommendationsList.innerHTML = '';  // Clear previous recommendations

  recommendations.forEach(recommendation => {
    const link = document.createElement('a');
    link.href = recommendation.url;  // Assuming recommendation has a URL property
    link.textContent = recommendation.title;  // Assuming recommendation has a title property
    link.className = 'recommendation-link';
    link.target = '_blank';  // Open links in a new tab
    recommendationsList.appendChild(link);
  });
}


