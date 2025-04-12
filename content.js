// function createNoteUI(content) {
//     const existing = document.getElementById('tab-note');
//     if (existing) return; // Prevent duplicates
  
//     const noteBox = document.createElement('textarea');
//     noteBox.id = 'tab-note';
//     noteBox.placeholder = 'Type your note here...';
//     noteBox.value = content;
  
//     noteBox.addEventListener('input', () => {
//       chrome.runtime.sendMessage({
//         type: 'SAVE_NOTE',
//         content: noteBox.value
//       });
//     });
  
//     document.body.appendChild(noteBox);
//   }
  
//   // Request saved note when content script loads
//   chrome.runtime.sendMessage({ type: 'GET_NOTE' }, (response) => {
//     createNoteUI(response.content);
//   });

// function showNote() {
//     // if we already have a note, show it
//     const existing = document.getElementById('tab-note');
//     if (existing) {
//         existing.style.display = 'block';
//         return;
//     }
  
//     // if not make a new one
//     const noteBox = document.createElement('textarea');
//     noteBox.id = 'tab-note';
//     noteBox.placeholder = 'Type your note here...';
  
//     // Request the note data from the background
//     chrome.runtime.sendMessage({ type: 'GET_NOTE' }, (response) => {
//       noteBox.value = response.content || '';
//     });
  
//     // When the user types, save it automatically
//     noteBox.addEventListener('input', () => {
//       chrome.runtime.sendMessage({
//         type: 'SAVE_NOTE',
//         content: noteBox.value
//       });
//     });
  
//     // add the note to the current webpage
//     document.body.appendChild(noteBox);
// }

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
        chrome.runtime.sendMessage({ type: 'SAVE_NOTE', content: '' });
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
    // wrapper.style.position = 'fixed';
    // wrapper.style.bottom = '20px';
    // wrapper.style.right = '20px';
    // wrapper.style.zIndex = 999999;
    // wrapper.style.background = '#fff8a6';
    // wrapper.style.border = '1px solid #ccc';
    // wrapper.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
    // wrapper.style.borderRadius = '8px';
    // wrapper.style.display = 'flex';
    // wrapper.style.flexDirection = 'column';
    // wrapper.style.width = '200px';

    // === Drag bar ===
    const dragBar = document.createElement('div');
    dragBar.id = 'tab-note-dragbar';
    // dragBar.textContent = '📝 Note';
    // dragBar.style.background = '#f6e58d';
    // dragBar.style.padding = '6px 10px';
    // dragBar.style.cursor = 'move';
    // dragBar.style.fontWeight = 'bold';
    // dragBar.style.userSelect = 'none';
    // dragBar.style.borderTopLeftRadius = '8px';
    // dragBar.style.borderTopRightRadius = '8px';

    // === Text area ===
    const noteBox = document.createElement('textarea');
    noteBox.id = 'tab-note';
    noteBox.placeholder = 'Type your note here...';
    // noteBox.style.resize = 'both';
    // noteBox.style.height = '150px';
    // noteBox.style.fontSize = '14px';
    // noteBox.style.padding = '10px';
    // noteBox.style.border = 'none';
    // noteBox.style.borderBottomLeftRadius = '8px';
    // noteBox.style.borderBottomRightRadius = '8px';

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
    chrome.runtime.sendMessage({ type: 'GET_NOTE' }, (response) => {
        noteBox.value = response.content || '';
    });

    noteBox.addEventListener('input', () => {
        chrome.runtime.sendMessage({
            type: 'SAVE_NOTE',
            content: noteBox.value
        });
    });
}