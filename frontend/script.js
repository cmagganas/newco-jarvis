document.addEventListener('DOMContentLoaded', function() {
    const startButton = document.getElementById('startButton');
    const shhButton = document.getElementById('shhButton'); // Get the SHH button
    shhButton.style.display = "none"
    const voiceDropdown = document.getElementById('voiceSelection');
    const settingsButton = document.getElementById('settings');
    const settings_pannel = document.getElementById('settings_pannel');
    const response = document.getElementById('response');
    const output = document.getElementById('output');
    let recognizing = false;

    let start_ih = "<i class='fas fa-microphone'></i> PLAY"
    let stop_ih =  "<i class='fas fa-microphone'></i> Stop"

    // update function calls speechSynthesis.speaking to render shh button
    setInterval(function() {
        if (speechSynthesis.speaking) {
            shhButton.style.display = "block"
            shhButton.innerHTML = "<i class='fas fa-volume-up'></i> SHH"
        } else {
            shhButton.style.display = "none"
        }

        //check if the recognition is running if so add pulsing to startButton
        if (recognizing) {
            startButton.classList.add("pulsing")
            startButton.innerHTML = stop_ih
        } else {
            startButton.classList.remove("pulsing")
            startButton.innerHTML = start_ih
        }

    }, 100);



    // Check for SpeechRecognition API support
    window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!window.SpeechRecognition) {
        console.error("Your browser does not support Speech Recognition.");
        return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = navigator.language || 'en-US';

    recognition.onstart = function() {
        recognizing = true;
        console.log("Speech recognition started. Speak into the microphone.");

    };

    recognition.onerror = function(event) {
        console.log(event)
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
                // typeWriter(finalTranscript.split(""), document.getElementById("user_input"));
                output.innerHTML = finalTranscript;
                return;
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
            // typeWriter(data.response.split(""), document.getElementById("response"));
            response.innerHTML = data.response;

            speakText(data.response);
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
        if (speechSynthesis.speaking) {
            speechSynthesis.cancel(); // This will stop the speech synthesis
        }
    }

    function toggleElement(element) {
        element.style.display = (element.style.display === "none" || element.style.display === "") ? "block" : "none";
    }
    settingsButton.addEventListener('click', function() {
        toggleElement(settings_pannel)
    }, false);
    

    //type writer function for the text from the server or from the user text reader
    function typeWriter(text, element) {
        // if (text.length > 0) {
        //     element.innerHTML += text.shift();
        //     setTimeout(function() {
        //         typeWriter(text, element);
        //     }, 50);
        // }
    }
});