chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'scrapeText') {
      // Scrape all visible text on the page
      const text = document.body.innerText;
      sendResponse({ text: text });
    }
  });

  console.log("Content script loaded successfully!");
