// Assuming the existence of populateVoiceList and speakText functions
// Ensure you define these functions based on your application's needs

let recognition;
let awaitingConfirmation = false;
let phraseForConfirmation = "";
let jsonData = { "action_state": false, "messages": [] };

// Initialize SpeechRecognition
window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (window.SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = navigator.language || 'en-US';

    recognition.onstart = function() {
        console.log("Voice recognition started. Speak into the microphone.");
    };

    recognition.onresult = function(event) {
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
                const finalTranscript = event.results[i][0].transcript.trim().toLowerCase();
                console.log("Final transcript:", finalTranscript);
                document.getElementById('output').innerHTML = finalTranscript;

                // Keyword extraction logic
                const actionPhrases = ["capa", "kappa", "kapa", "papa"];
                if (actionPhrases.includes(finalTranscript) && !awaitingConfirmation) {
                    awaitingConfirmation = true;
                    phraseForConfirmation = finalTranscript;
                    speakText(`Did you mean to initiate "${finalTranscript}"? Please confirm.`);
                } else if (awaitingConfirmation) {
                    if (finalTranscript.includes("yes") || finalTranscript.includes("confirm")) {
                        jsonData.action_state = true;
                        jsonData.messages.push({ "message": phraseForConfirmation, "processed": true });
                        updateJsonOutput();
                        speakText(`${phraseForConfirmation} confirmed and action initiated.`);
                        sendToServer(phraseForConfirmation);
                        awaitingConfirmation = false;
                    } else if (finalTranscript.includes("no") || finalTranscript.includes("cancel")) {
                        speakText(`Confirmation for "${phraseForConfirmation}" canceled.`);
                        awaitingConfirmation = false;
                    }
                }
            } else {
                interimTranscript += event.results[i][0].transcript;
            }
        }
        document.getElementById('response').innerHTML = interimTranscript;
    };

    recognition.onerror = function(event) {
        console.error('Speech recognition error detected:', event.error);
    };

    recognition.onend = function() {
        console.log("Voice recognition ended.");
    };
} else {
    console.error("Your browser does not support Speech Recognition.");
}

// Function to send data to server
function sendToServer(transcript) {
    fetch('http://localhost:8000/query', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: transcript })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
        jsonData.messages.push({ "message": transcript, "processed": data.response });
        updateJsonOutput();
        speakText(data.response); // Assuming 'data.response' is the text you want to speak
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}

// Function to update JSON output
function updateJsonOutput() {
    document.getElementById('jsonOutput').value = JSON.stringify(jsonData, null, 2);
}

// Event listeners for buttons
document.getElementById('startButton').addEventListener('click', () => {
    recognition.start();
});

document.getElementById('shhButton').addEventListener('click', () => {
    recognition.stop();
});

// Populate voice list and define the speakText function as needed
