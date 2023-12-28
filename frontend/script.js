document.addEventListener('DOMContentLoaded', function() {
    const startButton = document.getElementById('startButton');
    const stopButton = document.getElementById('stopButton');
    const shhButton = document.getElementById('shhButton'); // Get the SHH button
    const voiceDropdown = document.getElementById('voiceSelection');
    let recognizing = false;

    // Check for SpeechRecognition API support
    window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!window.SpeechRecognition) {
        console.error("Your browser does not support Speech Recognition.");
        return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = function() {
        recognizing = true;
        console.log("Speech recognition started. Speak into the microphone.");
    };

    recognition.onerror = function(event) {
        console.error("Speech recognition error detected: " + event.error);
    };

    recognition.onend = function() {
        recognizing = false;
        console.log("Speech recognition ended.");
    };

    recognition.onresult = function(event) {
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
                const finalTranscript = event.results[i][0].transcript;
                console.log("Final result: " + finalTranscript);
                // Send finalTranscript to the server
                sendToServer(finalTranscript);
            } else {
                interimTranscript += event.results[i][0].transcript;
                console.log("Interim result: " + interimTranscript);
            }
        }
    };
    
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
            // Speak out the response here
            speakText(data.response);
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    }

    
    // Function to populate voice options
    function populateVoiceList() {
        availableVoices = speechSynthesis.getVoices();
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
            return;
        }
        recognition.start();
    }, false);

    stopButton.addEventListener('click', function() {
        if (recognizing) {
            recognition.stop();
        }
    }, false);

    // Event listener for the SHH button to stop speaking
    shhButton.addEventListener('click', function() {
        stopSpeaking();
    }, false);

    // Function to stop speaking
    function stopSpeaking() {
        if (speechSynthesis.speaking) {
            speechSynthesis.cancel(); // This will stop the speech synthesis
        }
    }


});