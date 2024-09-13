chrome.runtime.onInstalled.addListener(() => {
    console.log("PearPhrase AI Web Reader installed!");
  });

  chrome.action.onClicked.addListener((tab) => {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content.js']
    });
  });
  