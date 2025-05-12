This project is not finished

This is a project for \[FD] - Framework Development

---

# How to make a tab notes extension for Firefox
This is a mini tutorial on how to make a Firefox extension which allows a user to save a sticky note on a browser tab. 
The note is connected to the tab, so regardless of what websites you visit, if the browser tab remains the same, so does the note.

### Example

![Usage example](/readme-images/usage.gif)

---

## Table of contents

1. [Manifest](#manifestjson)
2. [Background.js](#backgroundjs)
3. [Content.js](#contentjs)
4. [Popup.js](#popupjs)
5. [How scripts communicate](#this-is-how-the-scripts-communicate)
6. [How to run the extension](#how-to-run-the-extension-locally)

## Background

I am one of those people that has like 50 tabs opened in their browser and I swear they all have a purpose, or at least they did at the time I opened them. The problem is more often than not I forget why I opened certain tabs, and then I don't want to close them because what if I need them? I opened them for a reason right? And so I needed a way to remember why I opened a certain tab and what information I was searching there.

Thus, I need a way to write notes attached to a browser tab rather than a website. Because i most likely opened X tab in my browser because I encountered a problem in my code, wherther I am in StackOverflow or Reddit it's irrelevant, the tab's purpose is the same.

## Before we start

I am using Firefox, so this is a small tutorial specific for this browser. I will be using Manifest Version 2 which is the current way Firefox works (that being said, this wouldn't work in Chrome as they have switched over to Manifest Version 3).

This is the official documentation I have used in writing my code. I strogly recommend a read.

[Mozzila Documentation](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Your_first_WebExtension)

---

# So how does one build a browser extension?

We just need to create some files. At core, you only need these files (out of which
technically only the manifest is mandatory):

1. A folder for your extension files.
2. A manifest.json for the extensions settings.
3. A background.js which will always execute in the background of your browser.
4. A content.js which will inject code into the webpage.
5. A popup to see the extension options in the browser.
6. Icons.

This will be the exact structure for this extension:

```
.
├── README.md
├── manifest.json
├── background.js
├── content.js
├── style.css
├── popup
│   ├── popup.css
│   ├── popup.html
│   ├── popup.js
│   ├── slider.css
│   └── icons-48.png
└── icons
    ├── icons-48.png
    └── icons-96.png
```

# manifest.json

This contains metadata for the extension. Icons and description are optional but you should use them. They show up in the Add-ons Manager and make your extension looks more fancy.

```
"manifest_version": 2,
"name": "Tab Notes",
"version": "1.0",
"description": "Add a note tied to your current browser tab.",
"icons": {
    "48": "icons/icons-48.png",
    "96": "icons/icons-96.png"
}
```

This will tell the browser to load the ```content.js``` script into the Web pages that match ```[all_urls]```, which in this case means all pages.

Important note: Not all sites will allow for script injection. For example no extensions will work on pages from mozzila.org.

```
"content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["content.js"],
      "css": ["style.css"]
    }
]
```

This will tell the browser to execute the background.js script in the background. 
Meaning while the extension is running, this scripts will continuously 
be executed. This is a manifest V2 specific behaviour. In the newer 
Manifest V3 this is not the case. Background scripts will still be 
executed in the background but once they become idle, the execution stops. 
Therefore, saving data in memory will not work there.

```
"background": { 
    "scripts": ["background.js"]
},
```

This is how we can create options for our extension. When clicking the extension 
from the browser extension section, the ```popup.html``` file will be loaded.

```
"browser_action": {
    "default_icon": "icons/icons-48.png",
    "default_title": "Tab Notes",
    "default_popup": "popup/popup.html"
}
```

Something like this:

![Popup example](/readme-images/popup.png)

# background.js

This script gets executed in the background. It acts kind of like a server. It saves the notes for the tabs locally in memory and returns them when asked.

```
const tabNotes = {};
```

It listens for any messages that might come In our case they would come from the content script, for saving or retrieving the note.

```
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    const tabId = sender.tab.id;

    if (msg.type === 'SAVE_NOTE') {
        tabNotes[tabId] = msg.content;
    } else if (msg.type === 'GET_NOTE') {
        sendResponse({content: tabNotes[tabId] || ''});
    }
});
```

Using ```chrome.runtime.onMessage``` the components communicate with each other.
And specifically using ```chrome.tabs.sendMessage``` we can communicate with the content script only.

This tells the content script to show the note when the browser tab changes.
```
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tabNotes[tabId]) {
        chrome.tabs.sendMessage(tabId, {type: 'SHOW_NOTE'});
    }
});
```

And when a tab gets closed, the note gets removed.
``` 
chrome.tabs.onRemoved.addListener((tabId) => {
    delete tabNotes[tabId];
});
```

# content.js

This is the content script. It can inject input into the webpage. In our case, the note.
It communicates with the background to get and save notes and with the pop-up to creat, delete or hide notes.

Based on what the messaged received from either the background or the pop-up says, the script
will show, hide or delete the note.
``` 
chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === 'SHOW_NOTE') {
        showNote();
    } else if (msg.type === 'HIDE_NOTE') {
        hideNote();
    } else if (msg.type === 'UNHIDE_NOTE') {
        showNote();
    } else if (msg.type === 'DELETE_NOTE') {
        deleteNote();
    }
});
```

Functions for showing, hiding or deleting a note.

``` 
function hideNote() {
    const note = document.getElementById('tab-note-wrapper');
    if (note) { 
        note.style.display = 'none';
    }
}
```

```
function deleteNote() {
    const note = document.getElementById('tab-note-wrapper');
    if (note) {
        note.remove();
    }
    chrome.runtime.sendMessage({type: 'SAVE_NOTE', content: ''});
}
```

When we create the note, if it already exists in the background list then we show it. And as the user
types in the note it gets send to background for saving.

```
function showNote() {
    // Create UI for note if it doesn't exist, else unhide it
    createNote();

    // Show note logic
    // Fetch note from background
    chrome.runtime.sendMessage({type: 'GET_NOTE'}, (response) => {
        noteBox.value = response.content || '';
    });

    // Save note with every input
    noteBox.addEventListener('input', () => {
        chrome.runtime.sendMessage({
            type: 'SAVE_NOTE',
            content: noteBox.value
        });
    });
}
```

As for the note UI, I created it using JS code. You can see the details inside the file.


# popup.js

This is the popup script. It handles the button clicks and tells the content what to do.
The pop-up is the little options screen that appears when a user clicks on the extension in the extension bar.

![Gif showing how to open the popup](/readme-images/popup.gif)

When the page opens, either hide or show the note based on the values 
previously saved in local storage, and set the value of the "hide slider".

```chrome.tabs.query``` is an async call, therefore all code that depends on the result must be 
executed at the same time. Because all the code depends on the call result (the tab id), the async call
wraps around it.

```
document.addEventListener('DOMContentLoaded', () => {

    // Get the tab id
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        // Get value of slider from localStorage
        const label = "noteHidden" + tabs[0].id
        let result = localStorage.getItem(label);

        // Set the slider to the saved value
        if (result === "true") {
            checkbox.checked = true;
        } else {
            checkbox.checked = false;
        }

        // Hide or show the note
        if (result === "true") {
            sendToActiveTab({type: 'HIDE_NOTE'});
        } else {
            sendToActiveTab({type: 'UNHIDE_NOTE'});
        }
    });
});
```

Create a utility function to send a message to the current tab.

```
function sendToActiveTab(message) {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, message);
    });
}
```

Add the buttons onclick handlers, which send messsages to the content script.

Show note when clicking on ```create new note```
```
document.querySelector('button[type="create"]').addEventListener('click', () => {
    sendToActiveTab({type: 'SHOW_NOTE'});
});
```

Delete current note when clicking on ```delete note```
```
document.querySelector('button[type="delete"]').addEventListener('click', () => {
    sendToActiveTab({type: 'DELETE_NOTE'});
});
```

Hide or unhide depending on the value of the slider
```
let checkbox = document.querySelector("input[name=checkbox]");

checkbox.addEventListener('change', () => {
    const isChecked = checkbox.checked;

    // this to get tab id
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tabID = tabs[0].id;
        const label = "noteHidden" + tabID;

        // Save the new state of the slider
        localStorage.setItem(label, isChecked);

        // Send message to content script
        if (isChecked) {
            sendToActiveTab({ type: 'HIDE_NOTE' });
        } else {
            sendToActiveTab({ type: 'UNHIDE_NOTE' });
        }
    });
});
```

## This is how the scripts communicate

![Diagram with scripts communication](/readme-images/diagram.png)

## How to run the extension locally
If you have the extension code, you can run inside your Firefox browser as follows:

1. Type ```about:debugging#/runtime/this-firefox``` in a new browser tab. 
This will open a settings page where you can see your extensions. Here you can add a temporary extension.
2. Click on ```Load temporary Add-on``` and select your extensions manifest file.
3. Now you should see your extension added, you can test by going to a different browser tab.

Note: Extensions don't work in tabs opened with the ```developer.mozilla.org``` domain.

To submit the extension to mozzila: [extensionworkshop.com](https://extensionworkshop.com/documentation/publish/submitting-an-add-on/)