// Saving notes in memory
const tabNotes = {};

// Listening on messages from content
// Handle note requests and saves
browser.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    const tabId = sender.tab.id;

    if (msg.type === 'SAVE_NOTE') {
        tabNotes[tabId] = msg.content;
    } else if (msg.type === 'GET_NOTE') {
        sendResponse({content: tabNotes[tabId] || ''});
    }
});

// Listening on updated from the browser
// When the tab navigates to a new URL
browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tabNotes[tabId]) {
        browser.tabs.sendMessage(tabId, {type: 'SHOW_NOTE'});
    }
});

// Listening on updated from the browser
// Clean up if a tab is closed
browser.tabs.onRemoved.addListener((tabId) => {
    delete tabNotes[tabId];
});

