const tabNotes = {};

// Handle note requests and saves
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  const tabId = sender.tab.id;

  if (msg.type === 'SAVE_NOTE') {
    tabNotes[tabId] = msg.content;
  } else if (msg.type === 'GET_NOTE') {
    sendResponse({ content: tabNotes[tabId] || '' });
  }
});

// When the tab navigates to a new URL
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tabNotes[tabId]) {
      chrome.tabs.sendMessage(tabId, { type: 'SHOW_NOTE' });
    }
});

// Clean up if a tab is closed
chrome.tabs.onRemoved.addListener((tabId) => {
  delete tabNotes[tabId];
});