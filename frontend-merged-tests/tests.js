// tests.js
const fs = require('fs');
const path = require('path');

// Mock speechSynthesis and SpeechRecognition
global.speechSynthesis = {
    speak: jest.fn()
};

global.SpeechRecognition = function() {
    return {
        start: jest.fn(),
        stop: jest.fn(),
        onresult: jest.fn(),
        onstart: jest.fn(),
        onend: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn()
    };
};

// Load the HTML, CSS, and JavaScript files into the JSDOM environment
const html = fs.readFileSync(path.resolve(__dirname, 'index.html'));
const script = fs.readFileSync(path.resolve(__dirname, 'script.js'));
const style = fs.readFileSync(path.resolve(__dirname, 'style.css'));

document.documentElement.innerHTML = html.toString();

// Evaluate the script to make its functions and variables available in the tests
eval(script.toString());

describe("Jarvis and Becky's interaction", () => {
    test('Activating speech recognition starts listening for voice input', () => {
        // Simulate clicking the start button
        document.getElementById('startButton').click();

        // Check if speech recognition was started
        expect(global.SpeechRecognition.start).toHaveBeenCalled();
    });

    test('Speech recognition processes "CAPA" command and asks for confirmation', () => {
        const recognition = new SpeechRecognition();

        // Simulate receiving a voice command for "CAPA"
        recognition.onresult({
            resultIndex: 0,
            results: [[{transcript: 'CAPA', isFinal: true}]]
        });

        // Check if Jarvis asks for confirmation
        expect(speechSynthesis.speak).toHaveBeenCalledWith(expect.objectContaining({
            text: expect.stringContaining('Did you mean to initiate "CAPA"? Please confirm.')
        }));
    });

    // More tests can be added to simulate further interactions and confirmations
});

