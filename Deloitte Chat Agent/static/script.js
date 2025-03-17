$(document).ready(function() {
    const $promptInput = $('#prompt-input');
    const $sendButton = $('.send-btn');
    const $cancelButton = $('.cancel-btn');
    const $responseArea = $('#response-area');

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
            url: 'http://localhost:5000/api/chat',  // Explicitly use the full URL
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ prompt: prompt }),
            success: function(response) {
                $responseArea.text(response.response);
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
            }
        });
    }

    function handleCancel() {
        $promptInput.val('');
        $responseArea.text('');
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