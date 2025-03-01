// This script is injected into the auth callback page to extract auth data

// Function to extract auth data from the page
function extractAuthData() {
    // Look for auth data in the page
    // In a real implementation, this would extract from a specific element or global variable
    console.log("Auth callback script running, looking for auth data...");

    try {
        // In the real app, you would implement a mechanism to expose this data safely
        // For example, the app might set window.EXTENSION_AUTH_DATA with the token
        const authData = window.EXTENSION_AUTH_DATA;

        console.log("Auth data found:", authData ? "Yes" : "No");

        if (authData && authData.token) {
            sendAuthDataToBackground(authData);
        } else {
            console.log("No valid auth data found in window.EXTENSION_AUTH_DATA");
            // If no auth data is found but we're on the callback page, create a diagnostic element
            if (window.location.href.includes('auth-callback')) {
                const diagElement = document.createElement('div');
                diagElement.innerHTML = `
                    <div style="padding: 20px; text-align: center;">
                        <h3 style="color: #ef4444;">Authentication Data Not Found</h3>
                        <p>The extension is looking for authentication data but couldn't find it.</p>
                        <p>This could be because:</p>
                        <ul style="text-align: left; margin: 20px auto; max-width: 400px;">
                            <li>The auth callback page hasn't set window.EXTENSION_AUTH_DATA</li>
                            <li>The auth process is still in progress</li>
                            <li>There was an error during authentication</li>
                        </ul>
                    </div>
                `;

                // Add it to the page but don't replace existing content
                document.body.appendChild(diagElement);
            }
        }
    } catch (error) {
        console.error("Error extracting auth data:", error);

        // Create error element
        const errorElement = document.createElement('div');
        errorElement.innerHTML = `
            <div style="padding: 20px; text-align: center; color: #ef4444;">
                <h3>Error Processing Authentication</h3>
                <p>Error message: ${error.message}</p>
            </div>
        `;
        document.body.appendChild(errorElement);
    }
}

// Helper function to send auth data to the background script
function sendAuthDataToBackground(authData) {
    console.log("Sending auth data to background script...");

    // Send auth data to the background script
    chrome.runtime.sendMessage({
        type: 'AUTH_SUCCESS',
        token: authData.token,
        userId: authData.userId,
        username: authData.username || 'User'
    }, (response) => {
        if (chrome.runtime.lastError) {
            console.error("Error sending message to background script:", chrome.runtime.lastError);
        } else {
            console.log("Message sent successfully:", response);
        }
    });

    // Update the page to show success
    const messageElement = document.createElement('div');
    messageElement.textContent = 'Authentication successful! You can close this tab.';
    messageElement.style.padding = '20px';
    messageElement.style.textAlign = 'center';
    messageElement.style.fontSize = '18px';
    messageElement.style.color = '#10b981';

    // Append to body or replace content
    document.body.innerHTML = '';
    document.body.appendChild(messageElement);
}

// Also listen for the custom event from the page
window.addEventListener('PROMPTKIT_AUTH_SUCCESS', (event) => {
    console.log("Received custom PROMPTKIT_AUTH_SUCCESS event");
    // @ts-ignore
    const authData = event.detail;
    if (authData && authData.token) {
        sendAuthDataToBackground(authData);
    }
});

// Try to wait for the page to be fully loaded with auth data
setTimeout(() => {
    console.log("Extracting auth data after delay...");
    extractAuthData();
}, 1000);

// Also execute immediately in case the data is already available
extractAuthData();

// Note: In the absence of actual integration with the PromptKit app,
// this script would need to be modified to work with the app's auth system.
// The app would need to expose auth data in a way that this script can access. 