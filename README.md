This project is not finished

This is a project for \[FD] - Framework Development

---

# How to make a tab notes extension for Firefox

I am one of those people that has like 50 tabs opened in their browser and I swear they all have a purpose, or at least they did at the time I opened them. The problem is more often than not I forget why I opened certain tabs, and then I don't want to close them because what if I need them? I opened them for a reason right? And so I needed a way to remember why I opened a certain tab and what information I was searching there.

Thus, I need a way to write notes attached to a browser tab rather than a website. Because i most likely opened X tab in my browser because I encountered a problem in my code, wherther I am in StackOverflow or Reddit it's irrelevant, the tab's purpose is the same.

## Before we start

I am using Firefox, so this is a small tutorial specific for this browser. I will be using Manifest Version 2 which is the current way Firefox works (that being said, this wouldn't work in Chrome as they have switched over to Manifest Version 3).

This is the official documentation I have used in writing my code. I strogly recommend a read.

[Mozzila Documentation](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Your_first_WebExtension)

---

## So how does one build a browser extension?

We need to create some files:
1. A folder for your extension files.
2. A manifest.json for the extensions settings.
3. A background.js which will always execute in the background of your browser.
4. A content.js which will inject code into the webpage.
5. A popup to see the extension options in the browser.
6. Add icons.

This will be the structure for this extension:

```
.
├── README.md
├── background.js
├── content.js
├── icons
│   ├── icons-48.png
│   └── icons-96.png
├── manifest.json
├── popup
│   ├── popup.css
│   ├── popup.html
│   └── popup.js
└── style.css
```

## manifest.json

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
This contains metadata for the extension. Icons and description are optional but you should use them. They show up in the Add-ons Manager and make your extension looks more fancy.

```
"content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["content.js"],
      "css": ["style.css"]
    }
]
```
This will tell the browser to load the ```content.js``` script into the Web pages that match ```[all_urls]```, which in this case means all pages.

Important note: Not all sites will allow for script injection. For example no extensions will work on pages from mozzila.org.


```
"background": { 
    "scripts": ["background.js"]
},
```
This will tell the browser to execute the background.js script in the background. Meaning while the extension is running, this scripts will contiuosly be executed. This is a manifest V2 specific behaviour. In the newer Manifest V3 this is not the case. Background scripts will still be executed in the background but once they become idle, the execution stops. Therefore, saving data in memory will not work there.

```
"browser_action": {
    "default_icon": "icons/icons-48.png",
    "default_title": "Tab Notes",
    "default_popup": "popup/popup.html"
}
```
This is how we can create options for our extension. When clicking the extension from the browser extension section, the ```popup.html``` file will be loaded.

Something like this:

![Popup example](/readme-images/popup.png)

## background.js

This script gets executed in the background. It acts kind of like a server. It saves the notes for the tabs locally in memory and returns them when asked.

Using ```chrome.runtime.onMessage``` the components communicate with each other.
And specifically using ```chrome.tabs.sendMessage``` we can communicate with the content script only.

## content.js

This is the content script. It can inject input into the webpage. In our case, the note.
It communicates with the background to get and save notes and with the pop-up to creat, delete or hide notes.

## popup.js

This is the popup script. It handles the button clicks and tells the content what to do.
The pop-up is the little options screen that appears when a user clicks on the extension in the extension bar.

## This is how the scripts communicate

![Diagram with scripts communication](/readme-images/diagram.png)

## How to run the extension locally
If you have the extension code, you can run inside your Firefox browser as follows:

1. Type ```about:debugging#/runtime/this-firefox``` in a new browser tab. 
This will open a settings page where you can see your extensions. Here you can add a temporary extension.
2. Click on ```Load temporary Add-on``` and select your extensions manifest file.
3. Now you should see your extension added, you can test by going to a different browser tab.

Note: Extensions don't work in tabs opened with the ```developer.mozilla.org``` domain.