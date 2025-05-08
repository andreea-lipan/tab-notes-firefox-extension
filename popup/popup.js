// When opening the pop-up, set the slider to the correct value
// And hide or show the note
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

// function to send a message to the current tab
function sendToActiveTab(message) {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, message);
    });
}

// When clicking on create, send message to content to show note
document.querySelector('button[type="create"]').addEventListener('click', () => {
    sendToActiveTab({type: 'SHOW_NOTE'});
});

// When clicking on delete, send message to content to delete note
document.querySelector('button[type="delete"]').addEventListener('click', () => {
    sendToActiveTab({type: 'DELETE_NOTE'});
});

// When changing value of slider, send message to content to hide or show the note
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