$(document).ready(function() {
    const $promptInput = $('#prompt-input');
    const $sendButton = $('.send-btn');
    const $cancelButton = $('.cancel-btn');
    const $responseArea = $('#response-area');
    
    // Load chat history from localStorage
    let chatHistory = JSON.parse(localStorage.getItem('deloitteChatHistory')) || [];

    // Display chat history
    function displayChatHistory() {
        if (chatHistory.length === 0) {
            $responseArea.html('<p>No chat history available.</p>');
            return;
        }

        const historyHtml = chatHistory
            .slice() // Create a copy of the array
            .reverse() // Reverse the order
            .map(entry => `
                <div class="chat-entry">
                    <div class="timestamp">${entry.timestamp}</div>
                    <div class="question"><strong>Question:</strong> ${entry.prompt}</div>
                    <div class="answer"><strong>Answer:</strong> ${entry.response}</div>
                    <hr>
                </div>
            `).join('');

        $responseArea.html(historyHtml);
    }

    // Initial display of chat history
    displayChatHistory();

    function handleSend() {
        const prompt = $promptInput.val().trim();
        
        if (!prompt) {
            alert('Please enter a tax-related question.');
            return;
        }

        // Disable input and buttons during request
        $promptInput.prop('disabled', true);
        $sendButton.prop('disabled', true);
        $responseArea.text('Processing your request...');

        // Make Ajax request
        $.ajax({
            url: 'http://localhost:5000/api/chat',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ prompt: prompt }),
            success: function(response) {
                // Add new entry to chat history
                chatHistory.push({
                    timestamp: response.timestamp,
                    prompt: response.prompt,
                    response: response.response
                });

                // Save to localStorage
                localStorage.setItem('deloitteChatHistory', JSON.stringify(chatHistory));

                // Display updated history
                displayChatHistory();
            },
            error: function(xhr, status, error) {
                console.error('Error:', error);
                console.error('Status:', status);
                console.error('Response:', xhr.responseText);
                $responseArea.text('Error: Failed to get response. Check console for details.');
            },
            complete: function() {
                $promptInput.prop('disabled', false);
                $sendButton.prop('disabled', false);
                $promptInput.val(''); // Clear input after successful send
            }
        });
    }

    function handleCancel() {
        $promptInput.val('');
        $promptInput.prop('disabled', false);
        $sendButton.prop('disabled', false);
    }

    // Event Listeners
    $sendButton.on('click', handleSend);
    $cancelButton.on('click', handleCancel);
    
    // Handle Enter key in textarea
    $promptInput.on('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    });
}); 