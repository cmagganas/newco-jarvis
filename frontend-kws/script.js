// Check for SpeechRecognition API support
window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (!window.SpeechRecognition) {
    console.error("Your browser does not support Speech Recognition.");
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

function updateJsonOutput() {
    const jsonOutputElement = document.getElementById('jsonOutput');
    if (jsonOutputElement) {
        jsonOutputElement.value = JSON.stringify(jsonData, null, 2);
        console.log("JSON data updated");
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

  function processRecordedMessage(recordedMessage) {
    const words = recordedMessage.trim().toLowerCase().split(/\s+/);
    let foundPhrase = false;

    // Enhanced checking to ensure action phrases are recognized accurately
    words.forEach((word, index) => {
        if (actionPhrases.includes(word)) {
            foundPhrase = true;
            console.log(`Action phrase detected: ${word}`);
            // Assume confirmation if the next word is affirmatively contextual (e.g., "yes", "okay")
            // This part is simplified; in a real scenario, you'd need a more nuanced approach
            if (words[index + 1] && (words[index + 1] === 'yes' || words[index + 1] === 'okay')) {
                performActionBasedOnPhrase(word);
            } else {
                console.log(`Action phrase "${word}" detected but not confirmed.`);
                // Optionally, add logic here to prompt for verbal confirmation within the same session
            }
            return;
        }
    });

    if (!foundPhrase) {
        console.log("No action phrases found in the recorded message.");
    }
}

// Assuming a simple action output for demonstration purposes
function performActionBasedOnPhrase(phrase) {
    console.log(`Performing action for phrase: ${phrase}`);
    const actionOutput = `Action output for ${phrase}`; // Placeholder for actual action logic
    console.log("Action output:", actionOutput);
}

function startConfirmationProcess(phrase) {
    recognition.stop(); // Stop the main recognition process

    const confirmationRecognition = new window.SpeechRecognition();
    confirmationRecognition.lang = recognition.lang;
    confirmationRecognition.onresult = function(event) {
        const transcript = event.results[0][0].transcript.trim().toLowerCase();
        console.log("Confirmation heard:", transcript); // Log for debugging
        if (transcript.includes("yes")) {
            performActionBasedOnPhrase(phrase);
        } else {
            console.log("Confirmation denied.");
        }
        recognition.start(); // Resume the main recognition process
    };
    confirmationRecognition.onend = function() {
        console.log("Confirmation process ended.");
    };

    confirmationRecognition.start();
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

    recognition.onresult = function(event) {
        console.log("Speech recognition result detected.");

        for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
                const transcript = event.results[i][0].transcript.trim().toLowerCase();
                console.log("Final transcript:", transcript); // Log the final transcript for debugging
                const words = transcript.split(/\s+/);

                for (let word of words) {
                    if (word === "action") {
                        if (!isRecording) {
                            // Start recording
                            isRecording = true;
                            jsonData.action_state = true;
                            recordedMessage = ""; // Reset the recorded message
                            pulseButton('action'); // Pulse the action button
                            console.log("Recording started"); // For debugging
                            // Instead of directly updating JSON, first process the recorded message
                        }
                        continue; // Skip adding the word "action" to both recorded message and onscreen text
                    } else if (word === "terminate" && isRecording) {
                        isRecording = false;
                        console.log("Recording stopped. Processing message...");
                        processRecordedMessage(recordedMessage);
                        pulseButton('terminate'); // Pulse the terminate button

                        recordedMessage = "";
                        // continue; // Skip adding the word "terminate" to both recorded message and onscreen text

                    } else if (isRecording) {
                        recordedMessage += word + " ";
                    }
                }
                // Update the display of the final transcript, excluding 'action' and 'terminate'
                if (!isRecording) {
                    output.innerHTML += transcript.replace(/\b(action|terminate)\b/g, '') + ' ';
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

    // Speech Synthesis
    function speakText(text) {
        if (text !== '' && availableVoices.length > 0) {
            const selectedVoiceIndex = voiceDropdown.selectedOptions[0].value;
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.voice = availableVoices[selectedVoiceIndex];
            speechSynthesis.speak(utterance);
        }
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