// Listen for messages from the content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("Background script received message:", message);

    if (message.type === 'AUTH_SUCCESS') {
        console.log("Processing AUTH_SUCCESS message");

        // Validate message data
        if (!message.token) {
            console.error("Auth token missing from message");
            sendResponse({ success: false, error: "Auth token missing" });
            return;
        }

        // Store the authentication data
        chrome.storage.local.set({
            authToken: message.token,
            userId: message.userId,
            username: message.username
        }, () => {
            if (chrome.runtime.lastError) {
                console.error("Error storing auth data:", chrome.runtime.lastError);
                sendResponse({ success: false, error: chrome.runtime.lastError.message });
                return;
            }

            console.log('Auth data stored in extension');

            // Close the auth tab
            if (sender.tab) {
                chrome.tabs.remove(sender.tab.id)
                    .catch(err => console.error("Error closing tab:", err));
            }

            // Notify any open popup
            chrome.runtime.sendMessage({
                type: 'AUTH_UPDATED',
                isAuthenticated: true,
                username: message.username
            }, (response) => {
                if (chrome.runtime.lastError) {
                    console.error("Error sending message to popup:", chrome.runtime.lastError);
                } else {
                    console.log("Update sent to popup:", response);
                }
            });

            // Send response to the content script
            sendResponse({ success: true });
        });

        // Return true to indicate we will send a response asynchronously
        return true;
    }
});

// Listen for auth callback URL
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url && tab.url.includes('auth-callback?extension=true')) {
        console.log("Detected auth callback URL, injecting content script");

        // Inject content script to extract auth data
        chrome.scripting.executeScript({
            target: { tabId },
            files: ['js/auth-callback.js']
        }).then(() => {
            console.log("Content script injected successfully");
        }).catch(err => {
            console.error("Error injecting auth callback script:", err);
        });
    }
}); 