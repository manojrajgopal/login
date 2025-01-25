document.addEventListener("DOMContentLoaded", () => {
    const micButton = document.getElementById("mobile-navigation-mic-button"); // Mic button
    const planeButton = document.getElementById("mobile-navigation-paper-plane-button"); // Paper plane button
    const inputField = document.getElementById("mobile-navigation-outfit-input"); // Input field

    let isListening = false; // Track if voice recognition is active
    let typingTimer; // Timer for auto-submit

    // Show/hide buttons based on input
    const updateButtonStates = () => {
        if (inputField.value.trim() !== "") {
            planeButton.style.display = "inline-block";
        } else {
            planeButton.style.display = "none";
        }
    };

    // Function to send data to Flask
    const sendToFlask = (text) => {
        fetch('/process_voice', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text: text }) // Send the input text as JSON
        })
        .then(response => response.json())
        .then(data => {
            console.log("Server response:", data); // Log server response in the browser console
        })
        .catch(error => console.error("Error sending data to Flask:", error));
    };

    // Auto-submit function (send after 2 seconds of typing pause)
    const autoSubmit = () => {
        if (inputField.value.trim() !== "") {
            sendToFlask(inputField.value); // Send input text to Flask
            inputField.value = ""; // Clear input field after submitting
            updateButtonStates(); // Reset button visibility
        }
    };

    // Function to start wave animation in the input field
    const startWaveAnimation = () => {
        inputField.classList.add("waving"); // Add the wave animation class
        inputField.value = ""; // Clear the input field to show wave
    };

    // Function to stop the wave animation and reset to normal input text
    const stopWaveAnimation = () => {
        inputField.classList.remove("waving"); // Remove the wave animation class
    };

    // Check if SpeechRecognition is supported
    const isSpeechRecognitionSupported = () => {
        return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
    };

    // Speech recognition setup
    const startListening = () => {
        if (!isSpeechRecognitionSupported()) {
            alert("Your browser does not support Speech Recognition. Please use a supported browser like Chrome.");
            return;
        }

        isListening = true;
        console.log("Listening...");
        startWaveAnimation(); // Start the wave animation when listening

        const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.lang = "en-US"; // Set language to English
        recognition.interimResults = false; // Final results only
        recognition.continuous = false;

        recognition.onstart = () => {
            console.log("Speech recognition started...");
        };

        recognition.onspeechend = () => {
            console.log("Speech recognition ended.");
            recognition.stop();
        };

        recognition.onresult = (event) => {
            const speechResult = event.results[0][0].transcript;
            console.log("Recognized speech:", speechResult);
            inputField.value = speechResult; // Fill the input field with recognized speech
            updateButtonStates(); // Update button visibility
            sendToFlask(speechResult); // Send recognized speech to Flask
            
            // Pause for 3 seconds before stopping animation and submitting
            setTimeout(() => {
                stopWaveAnimation(); // Stop the animation after 3 seconds
            }, 3000); // 3 seconds pause before stopping animation
        };

        recognition.onerror = (event) => {
            console.error("Speech recognition error:", event.error); // Log the error
            stopWaveAnimation(); // Stop the animation in case of error
        };

        recognition.onend = () => {
            isListening = false; // Stop listening
            updateButtonStates(); // Reset button visibility
        };

        recognition.start();
    };

    // Mic button click event (for mobile compatibility)
    micButton.addEventListener("click", (e) => {
        e.preventDefault(); // Prevent the default behavior to ensure mobile support
        if (!isListening) {
            startListening();
        }
    });

    // Input field typing event
    inputField.addEventListener("input", () => {
        console.log("Typing..."); // Log to confirm the input event is firing
        updateButtonStates();

        clearTimeout(typingTimer); // Clear any previous timer
        typingTimer = setTimeout(autoSubmit, 2000); // Auto-submit after 2 seconds
    });

    // Paper plane button click event to submit the form
    planeButton.addEventListener("click", () => {
        console.log("Paper plane button clicked");
        if (inputField.value.trim() !== "") {
            sendToFlask(inputField.value); // Send input text to Flask
            inputField.value = ""; // Clear input field after submit
            updateButtonStates(); // Reset button visibility
        }
    });
});
