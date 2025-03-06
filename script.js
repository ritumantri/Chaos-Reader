let synth = null;
let isToneAvailable = false;

// Check if Tone is available
function initTone() {
    try {
        if (typeof Tone !== 'undefined') {
            synth = new Tone.PolySynth().toDestination();
            isToneAvailable = true;
            console.log("Tone.js initialized successfully");
        } else {
            console.warn("Tone.js is not loaded");
        }
    } catch (e) {
        console.error("Failed to initialize Tone.js:", e);
    }
}

// Attempt to load Tone
window.addEventListener('load', initTone);

function getColorFromPalette() {
    const palette = ['#000FFF', '#00FF03', '#EE0078'];
    return palette[Math.floor(Math.random() * palette.length)];
}

// Manual text splitting function
function splitText() {
    document.querySelectorAll('.chaos-zone p').forEach((paragraph, zoneIndex) => {
        const zoneClass = `zone-${zoneIndex + 1}`;
        const originalText = paragraph.textContent;
        let newHTML = '';
        
        // Split into words
        const words = originalText.split(' ');
        
        words.forEach((word, wordIndex) => {
            // Create word span
            newHTML += `<span class="word word-${wordIndex}" data-word="${word}" data-zone="${zoneIndex}">`;
            
            // Split into characters
            for (let charIndex = 0; charIndex < word.length; charIndex++) {
                const char = word[charIndex];
                newHTML += `<span class="char char-${charIndex}" data-char="${char}">${char}</span>`;
            }
            
            newHTML += '</span> ';
        });
        
        paragraph.innerHTML = newHTML;
    });
}

// Create highlight boxes on nearby words
function createHighlightBoxes(element, zoneIndex) {
    // Remove any existing highlight boxes
    document.querySelectorAll('.highlight-box').forEach(box => box.remove());
    
    // Get color for this zone
    const color = getColorFromPalette(zoneIndex);
    
    // Get all words in the same paragraph
    const paragraph = element.closest('p');
    const allWords = Array.from(paragraph.querySelectorAll('.word'));
    const currentIndex = allWords.indexOf(element);
    
    // Determine how many nearby words to highlight (based on zone level)
    const chaosLevel = zoneIndex + 1;
    const numHighlights = Math.min(chaosLevel, 5); // Cap at 5 highlights
    
    // Create a set to track which words we've highlighted
    const highlightedIndices = new Set([currentIndex]);
    
    // Create main highlight for hovered word
    createSingleHighlight(element, color);
    
    // Create highlights for nearby words
    for (let i = 0; i < numHighlights; i++) {
        // Get a random offset relative to current word
        const offset = Math.floor((Math.random() - 0.5) * chaosLevel * 6);
        const targetIndex = currentIndex + offset;
        
        // Make sure target is valid and we haven't highlighted it yet
        if (targetIndex >= 0 && 
            targetIndex < allWords.length && 
            targetIndex !== currentIndex &&
            !highlightedIndices.has(targetIndex)) {
            
            // Create highlight on this word
            createSingleHighlight(allWords[targetIndex], color);
            highlightedIndices.add(targetIndex);
        }
    }
}

// Create a single highlight box
function createSingleHighlight(element, color) {
    const rect = element.getBoundingClientRect();
    const box = document.createElement('div');
    box.classList.add('highlight-box');
    
    // Set position and size
    box.style.width = `${rect.width + 10}px`;
    box.style.height = `${rect.height + 10}px`;
    box.style.left = `${rect.left - 5 + window.scrollX}px`;
    box.style.top = `${rect.top - 5 + window.scrollY}px`;
    box.style.backgroundColor = color;
    box.style.position = 'absolute';
    box.style.zIndex = '-1';
    
    document.body.appendChild(box);
    
    // Add simple random movement
    function animateBox() {if (element.matches(':hover')) {
            requestAnimationFrame(animateBox);
        } else {
            setTimeout(() => {
                box.remove();
            }, 300);
        }
    }
    
    requestAnimationFrame(animateBox);
}

// Random note generator for hover
function getRandomNote() {
    const notes = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'];
    return notes[Math.floor(Math.random() * notes.length)];
}

// Random symbol generator
function getRandomSymbol() {
    const symbols = ['!', '@', '#', '$', '%', '^', '&', '*', '~', '?', '+', '=', '<', '>', '|'];
    return symbols[Math.floor(Math.random() * symbols.length)];
}

// Progress bar updater
function updateProgressBar() {
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight - windowHeight;
    const scrolled = window.scrollY;
    
    const progress = (scrolled / documentHeight) * 100;
    document.getElementById('progressBar').style.width = progress + '%';
    
    // Apply chaos effects based on scroll position
    applyScrollBasedChaos(progress);
}

// Apply chaos based on scroll position
function applyScrollBasedChaos(progress) {
    document.querySelectorAll('.word').forEach((word, index) => {
        // Higher chance of effects as we scroll down
        const chaosFactor = progress / 100;
        
        // Random effects based on position
        if (Math.random() < chaosFactor * 0.1) {
            word.classList.add('glitch');
            setTimeout(() => {
                word.classList.remove('glitch');
            }, 500);
        }
    });

    document.querySelectorAll('.char').forEach((char, index) => {
        // Higher chance of effects as we scroll down
        const chaosFactor = progress / 100;
        
        // Random effects based on position
        if (Math.random() < chaosFactor * 0.05) {
            char.classList.add('jitter');
            setTimeout(() => {
                char.classList.remove('jitter');
            }, 300);
        }
        
        // Random disappearing
        if (Math.random() < chaosFactor * 0.01) {
            char.style.opacity = '0';
            setTimeout(() => {
                char.style.opacity = '1';
            }, 1000);
        }
        
        // Random color
        if (Math.random() < chaosFactor * 0.02) {
            const colors = ['#000FFF', '#00FF03', '#EE0078'];
            char.style.color = colors[Math.floor(Math.random() * colors.length)];
            setTimeout(() => {
                char.style.color = '';
            }, 800);
        }
    });
}

// Add event listeners
function addEventListeners() {
    // Word level effects
    document.querySelectorAll('.word').forEach((word) => {
        const zoneIndex = parseInt(word.getAttribute('data-zone'));
        
        word.addEventListener('mouseenter', () => {
            // Create highlight boxes on this and nearby words
            createHighlightBoxes(word, zoneIndex);
            
            // Play a random note if synth is available
            if (isToneAvailable && synth) {
                try {
                    synth.triggerAttackRelease(getRandomNote(), '8n');
                } catch (e) {
                    console.error("Error playing note:", e);
                    // If we encounter an error, disable Tone.js for future
                    isToneAvailable = false;
                }
            }
        });
    });

    // Zone 4 specific - random symbols on hover
    document.querySelectorAll('.zone-4 .char').forEach(char => {
        char.addEventListener('mouseenter', () => {
            const originalChar = char.getAttribute('data-char');
            char.textContent = getRandomSymbol();
            
            setTimeout(() => {
                char.textContent = originalChar;
            }, 800);
        });
    });

    // Zone 5 specific - extreme chaos
    document.querySelectorAll('.zone-5 .char').forEach(char => {
        char.addEventListener('mouseenter', () => {
            const originalChar = char.getAttribute('data-char');
            char.classList.add('glitch');
            char.textContent = getRandomSymbol();
            
            setTimeout(() => {
                char.textContent = originalChar;
                char.classList.remove('glitch');
            }, 800);
        });
    });
}

// Initialize everything
document.addEventListener('DOMContentLoaded', () => {
    splitText();
    addEventListeners();
    window.addEventListener('scroll', updateProgressBar);
    updateProgressBar(); // Initial call
})