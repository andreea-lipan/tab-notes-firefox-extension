// Listening for messages from
chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === 'SHOW_NOTE') {
        showNote();
    } else if (msg.type === 'HIDE_NOTE') {
        const note = document.getElementById('tab-note-wrapper');
        if (note) note.style.display = 'none';
    } else if (msg.type === 'UNHIDE_NOTE') {
        const note = document.getElementById('tab-note-wrapper');
        if (note) note.style.display = 'block';
    } else if (msg.type === 'DELETE_NOTE') {
        const note = document.getElementById('tab-note-wrapper');
        if (note) note.remove();
        chrome.runtime.sendMessage({type: 'SAVE_NOTE', content: ''});
    }
});

function showNote() {
    const existing = document.getElementById('tab-note-wrapper');
    if (existing) {
        existing.style.display = 'block';
        return;
    }

    // === Wrapper ===
    const wrapper = document.createElement('div');
    wrapper.id = 'tab-note-wrapper';

    // === Drag bar ===
    const dragBar = document.createElement('div');
    dragBar.id = 'tab-note-dragbar';

    // === Text area ===
    const noteBox = document.createElement('textarea');
    noteBox.id = 'tab-note';
    noteBox.placeholder = 'Type your note here...';

    // === Assemble UI ===
    wrapper.appendChild(dragBar);
    wrapper.appendChild(noteBox);


    // === Drag Logic ===
    let isDragging = false;
    let offsetX = 0;
    let offsetY = 0;

    dragBar.addEventListener('mousedown', (e) => {
        isDragging = true;
        offsetX = e.clientX - wrapper.getBoundingClientRect().left;
        offsetY = e.clientY - wrapper.getBoundingClientRect().top;
        wrapper.style.transition = 'none';
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        wrapper.style.left = `${e.clientX - offsetX}px`;
        wrapper.style.top = `${e.clientY - offsetY}px`;
        wrapper.style.bottom = 'auto';
        wrapper.style.right = 'auto';
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
    });

    document.body.appendChild(wrapper);

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