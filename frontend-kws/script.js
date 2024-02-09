// Check for SpeechRecognition API support
window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (!window.SpeechRecognition) {
    console.error("Your browser does not support Speech Recognition.");
}

let awaitingConfirmation = false;
let phraseForConfirmation = "";

function speakText(text) {
    if (text !== '' && speechSynthesis.getVoices().length > 0) {
        const utterance = new SpeechSynthesisUtterance(text);
        speechSynthesis.speak(utterance);
    }
}

const recognition = new SpeechRecognition();
recognition.continuous = true;
recognition.interimResults = false; // Changed to false to simplify handling confirmations
recognition.lang = navigator.language || 'en-US';

const specialWords = ["action", "terminate"];
const specialButtons = {
    "action": document.getElementById('actionButton'),
    "terminate": document.getElementById('terminateButton')
};

let jsonData = {
    "action_state": false,
    "messages": []
};
let actionState = false;


function updateJsonOutput() {
    const jsonOutputElement = document.getElementById('jsonOutput');
    if (jsonOutputElement) {
        jsonOutputElement.value = JSON.stringify(jsonData, null, 2);
        console.log("JSON data updated");

        // Scroll to the bottom of the textarea
        jsonOutputElement.scrollTop = jsonOutputElement.scrollHeight;
    } else {
        console.error("Could not find the JSON output element.");
    }
}


// Define action phrases and apiDatabase
const actionPhrases = ["capa", "kappa", "kapa", "papa"];
// load samples/sample_machine_db.json file as apiDatabase
const apiDatabase = {
    "Minster": {
      "Machine Specifications": {
        "Model": "Minster P2-150",
        "Serial Number": "P21502345",
        "Type of Press": "High-speed mechanical",
        "Capacity": "150 tonnes",
        "Bed Size": "1200 mm x 800 mm",
        "Stroke Length": "150 mm",
        "Speed": "0-300 strokes per minute"
      }
    }
  };

 
// Assuming a simple action output for demonstration purposes
function performActionBasedOnPhrase(phrase) {
    console.log(`Performing action for phrase: ${phrase}`);
    const actionOutput = `Action output for ${phrase}`; // Placeholder for actual action logic
    console.log("Action output:", actionOutput);
}



updateJsonOutput();

document.addEventListener('DOMContentLoaded', function() {
    const actionButton = document.getElementById('actionButton');
    const terminateButton = document.getElementById('terminateButton');
    if (!actionButton || !terminateButton) {
        console.error("Buttons not found");
        return;
    }
    const startButton = document.getElementById('startButton');
    const shhButton = document.getElementById('shhButton'); // Get the SHH button
    const voiceDropdown = document.getElementById('voiceSelection');
    const settingsButton = document.getElementById('settings');
    const settings_pannel = document.getElementById('settings_pannel');
    const response = document.getElementById('response');
    const output = document.getElementById('output');
    let recognizing = false;

    let start_ih = "<i class='fas fa-microphone'></i> PLAY";
    let stop_ih =  "<i class='fas fa-microphone'></i> Stop";

    // update function calls speechSynthesis.speaking to render shh button
    setInterval(function() {
        if (audio.pause) {
            shhButton.style.display = "block";
            shhButton.innerHTML = "<i class='fas fa-volume-up'></i> SHH";
        } else {
            shhButton.style.display = "none";
        }

        // Check if the recognition is running if so add pulsing to startButton
        if (recognizing) {
            startButton.classList.add("pulsing");
            startButton.innerHTML = stop_ih;
        } else {
            startButton.classList.remove("pulsing");
            startButton.innerHTML = start_ih;
        }

    }, 100);

    recognition.onstart = function() {
        recognizing = true;
        output.innerHTML ="";
        response.innerHTML = "";
    };

    recognition.onerror = function(event) {
        console.log(event);
        console.error("Speech recognition error detected: " + event.error);
    };

    recognition.onend = function() {
        recognizing = false;
        console.log("Speech recognition ended.");
    };

    let recordedMessage = "";
    let isRecording = false;

    let ignoreNextInput = false; // Flag to ignore the next speech input
    

    recognition.onresult = function(event) {
        for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                const transcript = event.results[i][0].transcript.trim().toLowerCase();
                console.log("Final transcript:", transcript);

                if (ignoreNextInput) {
                    console.log("Ignored input:", transcript);
                    ignoreNextInput = false; // Reset the flag after ignoring one input
                    return; // Exit early to not process this input further
                }

                // Handle the immediate action for "action" command
                if (transcript === "action") {
                    console.log("Action command detected.");
                    pulseButton('action');
                    jsonData.action_state = true;
                    actionState = true; // Assuming this should be set here to indicate that an action command was recognized
                    updateJsonOutput();
                } else if (transcript === "terminate") {
                    console.log("Terminate command detected. Terminating.");
                    recognition.stop(); // Optionally stop recognition here if that's the intended action
                    jsonData.action_state = false;
                    actionState = false; // Reset action state
                    updateJsonOutput();
                    return; // Exit early
                } else if (actionState && actionPhrases.includes(transcript) && !awaitingConfirmation) {
                    // If an action command was given, check for action phrases, and not already awaiting confirmation
                    awaitingConfirmation = true;
                    phraseForConfirmation = transcript;
                    
                    speakText(`Did you say "${transcript}"?`);
                    ignoreNextInput = true;

                    return; // Wait for next result for confirmation
                } else if (awaitingConfirmation) {
                    // Now checking for confirmation
                    if (transcript.includes("yes")) {
                        console.log(`Confirmed: ${phraseForConfirmation}`);
                        performActionBasedOnPhrase(phraseForConfirmation);
                        jsonData.messages.push({apiDatabase}); // Assuming this should be structured differently to include relevant data
                        speakText('Action confirmed. I added the data from the PLEX');
                        ignoreNextInput = true;
                        updateJsonOutput();
                    } else {
                        console.log(`Confirmation for '${phraseForConfirmation}' was denied.`);
                    }
                    awaitingConfirmation = false; // Reset confirmation state
                    phraseForConfirmation = "";
                    actionState = false; // Reset action state if needed
                    return; // Exit after handling confirmation
                }
            }
        }
    };

    
    

    // Function to add pulsing effect to buttons when special words are detected
    function pulseButton(word) {
        const button = specialButtons[word];
        if (button) {
            button.classList.add("pulsing");
            setTimeout(() => {
                button.classList.remove("pulsing");
            }, 1000); // The duration for pulsing effect can be adjusted
        }
    }

    var audio = '';

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
            console.log('Success:', data.response);
            // Speak out the response here
            typeWriter(data.response, 0);
            const audio_uri = "data:audio/wav;base64,"+data.audio;
            audio = new Audio(audio_uri);
            audio.play();

            // speakText(data.response);
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    }

    // Function to populate voice options
    function populateVoiceList() {
        availableVoices = speechSynthesis.getVoices();
        if(availableVoices.length == 0){
            return;
        }
        voiceDropdown.innerHTML = '';
    
        availableVoices.forEach((voice, index) => {
            const option = document.createElement('option');
            option.textContent = voice.name + ' (' + voice.lang + ')';
            
            if(voice.default) {
                option.textContent += ' -- DEFAULT';
            }

            option.setAttribute('data-lang', voice.lang);
            option.setAttribute('data-name', voice.name);
            option.value = index;
            voiceDropdown.appendChild(option);
        });
    }

    // Initialize voice list or handle changes
    populateVoiceList();
    if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = populateVoiceList;
    }

 

    startButton.addEventListener('click', function() {
        if (recognizing) {
            recognition.stop();
            recognizing = false;
            return;
        }
        
        recognition.start();
    }, false);

    shhButton.addEventListener('click', function() {
        stopSpeaking();
    }, false);

    // Function to stop speaking
    function stopSpeaking() {
        if (audio.pause) {
            audio.pause();
        }
    }

    function toggleElement(element) {
        element.style.display = (element.style.display === "none" || element.style.display === "") ? "block" : "none";
    }
    settingsButton.addEventListener('click', function() {
        toggleElement(settings_pannel);
    }, false);

    function typeWriter(text, index) {
        const intervalId = setInterval(() => {
            response.innerHTML += text.charAt(index);
            index++;
            if (index === text.length) {
                clearInterval(intervalId);
            }
        }, Math.abs(response.innerHTML.length - index));
    }

    // Event listener for actionButton
    actionButton.addEventListener('click', function() {
        console.log("Action button clicked"); // Debugging log
        jsonData.action_state = true;
        jsonData.messages.push({
            "message": "Sample message",
            "processed": ""
        });
        updateJsonOutput();
    });

    // Event listener for terminateButton
    terminateButton.addEventListener('click', function() {
        console.log("Terminate button clicked"); // Debugging log
        jsonData.action_state = false;
        updateJsonOutput();
    });
    
    });