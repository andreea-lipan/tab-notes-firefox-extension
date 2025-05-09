// Listening for messages from popup or background
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

function hideNote() {
    const note = document.getElementById('tab-note-wrapper');
    if (note) { 
        note.style.display = 'none';
    }
}

function deleteNote() {
    const note = document.getElementById('tab-note-wrapper');
    if (note) {
        note.remove();
    }
    chrome.runtime.sendMessage({type: 'SAVE_NOTE', content: ''});
}

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

function createNote() {
    const existing = document.getElementById('tab-note-wrapper');
    if (existing) {
        existing.style.display = 'block';
        return;
    }

    // Create note UI
    var wrapper, dragBar;
    createNoteUI(wrapper, dragBar);

    // Add drag logic
    dragLogic(dragBar, wrapper);

    // Add note to DOM
    document.body.appendChild(wrapper);
}

function createNoteUI(wrapper, dragBar) {
    // Wrapper for dragbar and note
    wrapper = document.createElement('div');
    wrapper.id = 'tab-note-wrapper';

    // Drag bar
    dragBar = document.createElement('div');
    dragBar.id = 'tab-note-dragbar';

    // Note text area
    noteBox = document.createElement('textarea');
    noteBox.id = 'tab-note';
    noteBox.placeholder = 'Type your note here...';

    // Assemble UI
    wrapper.appendChild(dragBar);
    wrapper.appendChild(noteBox);
}

function dragLogic(dragBar, wrapper) {
    // Drag Logic
    let isDragging = false;
    let offsetX = 0;
    let offsetY = 0;

    // Start dragging
    dragBar.addEventListener('mousedown', (e) => {
        isDragging = true;
        offsetX = e.clientX - wrapper.getBoundingClientRect().left;
        offsetY = e.clientY - wrapper.getBoundingClientRect().top;
        wrapper.style.transition = 'none';
    });

    // Move note with mouse, runs continuously as you move your mouse
    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        wrapper.style.left = `${e.clientX - offsetX}px`;
        wrapper.style.top = `${e.clientY - offsetY}px`;
        wrapper.style.bottom = 'auto';
        wrapper.style.right = 'auto';
    });

    // Stop dragging
    document.addEventListener('mouseup', () => {
        isDragging = false;
    });
}