document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const chatDisplay = document.getElementById('chat-display');
    const userInput = document.getElementById('user-input');
    const voiceBtn = document.getElementById('voice-btn');
    const sendBtn = document.getElementById('send-btn');
    const feedbackContent = document.getElementById('feedback-content');
    const sessionCount = document.getElementById('session-count');
    const correctionCount = document.getElementById('correction-count');
    const accuracy = document.getElementById('accuracy');
    const tutorAvatar = document.querySelector('.tutor-avatar');
    
    // State variables
    let isListening = false;
    let recognition;
    let sessionCorrections = 0;
    let sessionMessages = 0;
    
    // Initialize speech recognition
    function initSpeechRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = 'en-US';
            
            recognition.onstart = function() {
                isListening = true;
                voiceBtn.classList.add('listening');
                tutorAvatar.classList.add('speaking');
            };
            
            recognition.onresult = function(event) {
                const transcript = event.results[0][0].transcript;
                userInput.value = transcript;
                processUserMessage(transcript);
            };
            
            recognition.onerror = function(event) {
                console.error('Speech recognition error', event.error);
                displayMessage('ai', "I'm having trouble hearing you. Please try again or type your message.");
                resetListeningState();
            };
            
            recognition.onend = function() {
                resetListeningState();
            };
        } else {
            voiceBtn.disabled = true;
            voiceBtn.title = "Speech recognition not supported in your browser";
            displayMessage('ai', "Your browser doesn't support speech recognition. Please type your messages instead.");
        }
    }
    
    function resetListeningState() {
        isListening = false;
        voiceBtn.classList.remove('listening');
        tutorAvatar.classList.remove('speaking');
    }
    
    // Initialize text-to-speech
    function speakText(text) {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'en-US';
            utterance.rate = 1.0;
            utterance.pitch = 1.1;
            
            // Show speaking animation
            tutorAvatar.classList.add('speaking');
            
            utterance.onstart = function() {
                tutorAvatar.classList.add('speaking');
            };
            
            utterance.onend = function() {
                tutorAvatar.classList.remove('speaking');
            };
            
            speechSynthesis.speak(utterance);
        }
    }
    
    // Display message in chat
    function displayMessage(sender, text, correction) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message');
        messageDiv.classList.add(sender === 'user' ? 'user-message' : 'ai-message');
        messageDiv.textContent = text;
        
        if (correction) {
            const correctionDiv = document.createElement('div');
            correctionDiv.classList.add('correction');
            correctionDiv.innerHTML = `<i class="fas fa-graduation-cap"></i> ${correction}`;
            messageDiv.appendChild(correctionDiv);
        }
        
        chatDisplay.appendChild(messageDiv);
        chatDisplay.scrollTop = chatDisplay.scrollHeight;
    }
    
    // Process user message
    function processUserMessage(message) {
        if (!message.trim()) return;
        
        // Display user message
        displayMessage('user', message);
        sessionMessages++;
        
        // Simulate AI processing delay
        setTimeout(() => {
            // Generate AI response
            const response = generateAIResponse(message);
            
            // Display AI response
            displayMessage('ai', response.text, response.correction);
            
            // Update feedback
            if (response.correction) {
                sessionCorrections++;
                feedbackContent.innerHTML = `
                    <div><strong>Your sentence:</strong> ${message}</div>
                    <div><strong>Improved version:</strong> <span class="highlight">${response.corrected || message}</span></div>
                    <div><strong>Explanation:</strong> ${response.correction}</div>
                `;
                
                // Show additional tip occasionally
                if (Math.random() > 0.7) {
                    const tipDiv = document.createElement('div');
                    tipDiv.classList.add('tip');
                    tipDiv.innerHTML = `<i class="fas fa-lightbulb"></i> <strong>Language Tip:</strong> ${response.tip}`;
                    feedbackContent.appendChild(tipDiv);
                }
            } else {
                feedbackContent.innerHTML = "Great job! Your sentence was grammatically correct. Keep practicing!";
            }
            
            // Update stats
            correctionCount.textContent = sessionCorrections;
            sessionCount.textContent = Math.floor(sessionMessages / 3) + 1;
            accuracy.textContent = Math.round((sessionMessages - sessionCorrections) / sessionMessages * 100) + '%';
            
            // Speak AI response
            speakText(response.text);
        }, 1000);
    }
    
    // Generate AI response with correction
    function generateAIResponse(message) {
        const responses = [
            {
                text: "That's a great start! I would suggest: 'I have been to Paris' instead of 'I was in Paris'.",
                correction: "We use present perfect (have been) for experiences when we don't specify exactly when they happened.",
                corrected: "I have been to Paris.",
                tip: "Use present perfect tense for life experiences when the time is not specified."
            },
            {
                text: "Nice try! The correct phrase is: 'How long have you been studying English?'",
                correction: "We use present perfect continuous for actions that started in the past and continue to the present.",
                corrected: "How long have you been studying English?",
                tip: "Present perfect continuous is ideal for actions that started in the past and continue now."
            },
            {
                text: "Good effort! A more natural way is: 'Could you please repeat that?'",
                correction: "'Could' is more polite than 'can' in requests, and 'repeat' is more natural than 'say again'.",
                corrected: "Could you please repeat that?",
                tip: "Use 'could' instead of 'can' to make requests sound more polite."
            },
            {
                text: "Interesting! The correct structure is: 'If I had more time, I would travel more'.",
                correction: "This is a second conditional sentence for hypothetical situations. We use 'if + past simple, would + base verb'.",
                corrected: "If I had more time, I would travel more.",
                tip: "Second conditional sentences express unreal or unlikely present/future situations."
            },
            {
                text: "Well done! Your sentence is grammatically correct. Let's continue our conversation.",
                correction: null,
                tip: "Vary your sentence structures to sound more natural in conversation."
            }
        ];
        
        // Simple keyword matching for demo purposes
        const lowerMsg = message.toLowerCase();
        if (lowerMsg.includes("paris") || lowerMsg.includes("france")) return responses[0];
        if (lowerMsg.includes("study") || lowerMsg.includes("learning")) return responses[1];
        if (lowerMsg.includes("repeat") || lowerMsg.includes("say again")) return responses[2];
        if (lowerMsg.includes("if i") && lowerMsg.includes("would")) return responses[3];
        
        // Default response
        return responses[4];
    }
    
    // Event listeners
    voiceBtn.addEventListener('click', function() {
        if (isListening) {
            recognition.stop();
            resetListeningState();
        } else {
            if (recognition) {
                recognition.start();
            }
        }
    });
    
    sendBtn.addEventListener('click', function() {
        if (userInput.value.trim()) {
            processUserMessage(userInput.value);
            userInput.value = '';
        }
    });
    
    userInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && userInput.value.trim()) {
            processUserMessage(userInput.value);
            userInput.value = '';
        }
    });
    
    // Initialize the app
    initSpeechRecognition();
    
    // Demo auto-response after 5 seconds
    setTimeout(() => {
        displayMessage('ai', "I'm here to help you improve your speaking skills. Tell me about your language learning goals or ask me a question!");
    }, 5000);
});
