// This script is injected into the auth callback page to extract auth data

// Function to extract auth data from the page
function extractAuthData() {
    console.log("Auth callback script running, looking for auth data...");
    console.log("Current URL:", window.location.href);

    try {
        // Try to get auth data from the global variable set by the app
        if (window.EXTENSION_AUTH_DATA) {
            console.log("Auth data found in window.EXTENSION_AUTH_DATA");
            sendAuthDataToBackground(window.EXTENSION_AUTH_DATA);
            return;
        }

        // If window.EXTENSION_AUTH_DATA isn't available yet, we'll check if we're on the right page
        if (window.location.href.includes('auth-callback') && window.location.href.includes('extension=true')) {
            console.log("On auth callback page, but auth data not found yet");

            // Add a diagnostic element to show that we're looking for auth data
            const diagElement = document.createElement('div');
            diagElement.id = 'extension-auth-status';
            diagElement.innerHTML = `
                <div style="padding: 10px; margin: 10px; border: 1px solid #ccc; border-radius: 5px; background-color: #f8f9fa;">
                    <h4 style="margin: 0 0 10px 0;">Extension Authentication Status</h4>
                    <p>The extension is waiting for authentication data...</p>
                    <p>Status: Looking for window.EXTENSION_AUTH_DATA</p>
                    <p>If this message persists, please try signing in again.</p>
                </div>
            `;

            // Add it to the page if it doesn't already exist
            if (!document.getElementById('extension-auth-status')) {
                document.body.appendChild(diagElement);
            }
        } else {
            console.log("Not on the expected auth callback page");
        }
    } catch (error) {
        console.error("Error extracting auth data:", error);

        // Create error element
        const errorElement = document.createElement('div');
        errorElement.innerHTML = `
            <div style="padding: 20px; text-align: center; color: #ef4444;">
                <h3>Error Processing Authentication</h3>
                <p>Error message: ${error.message}</p>
                <p>Please try signing in again or contact support if the issue persists.</p>
            </div>
        `;
        document.body.appendChild(errorElement);
    }
}

// Helper function to send auth data to the background script
function sendAuthDataToBackground(authData) {
    console.log("Sending auth data to background script...");

    if (!authData || !authData.token) {
        console.error("Invalid auth data:", authData);
        return;
    }

    // Send auth data to the background script
    chrome.runtime.sendMessage({
        type: 'AUTH_SUCCESS',
        token: authData.token,
        userId: authData.userId,
        username: authData.username || 'User'
    }, (response) => {
        if (chrome.runtime.lastError) {
            console.error("Error sending message to background script:", chrome.runtime.lastError);

            // Create an error message for the user
            const errorMsg = document.createElement('div');
            errorMsg.innerHTML = `
                <div style="padding: 20px; text-align: center; color: #ef4444;">
                    <h3>Authentication Error</h3>
                    <p>Could not communicate with the extension. Please try again or restart your browser.</p>
                    <p>Error: ${chrome.runtime.lastError.message || 'Unknown error'}</p>
                </div>
            `;
            document.body.innerHTML = '';
            document.body.appendChild(errorMsg);
        } else {
            console.log("Auth message sent successfully:", response);

            // Update the page to show success
            const messageElement = document.createElement('div');
            messageElement.innerHTML = `
                <div style="padding: 20px; text-align: center;">
                    <h3 style="color: #10b981; margin-bottom: 10px;">Authentication Successful!</h3>
                    <p>You can close this tab and return to the extension.</p>
                    <p style="font-size: 0.8em; margin-top: 20px;">This tab will close automatically in a few seconds.</p>
                </div>
            `;

            // Replace page content
            document.body.innerHTML = '';
            document.body.appendChild(messageElement);

            // Auto-close tab after a delay
            setTimeout(() => {
                window.close();
            }, 3000);
        }
    });
}

// Listen for the custom event from the page
window.addEventListener('PROMPTKIT_AUTH_SUCCESS', (event) => {
    console.log("Received custom PROMPTKIT_AUTH_SUCCESS event");
    // @ts-ignore
    const authData = event.detail;
    if (authData && authData.token) {
        sendAuthDataToBackground(authData);
    } else {
        console.error("Invalid auth data in PROMPTKIT_AUTH_SUCCESS event:", authData);
    }
});

// Check periodically for the auth data
let checkCount = 0;
const maxChecks = 20; // Check for 10 seconds (20 * 500ms)
const checkInterval = setInterval(() => {
    checkCount++;
    console.log(`Checking for auth data (${checkCount}/${maxChecks})...`);

    if (window.EXTENSION_AUTH_DATA) {
        console.log("Auth data found after waiting!");
        sendAuthDataToBackground(window.EXTENSION_AUTH_DATA);
        clearInterval(checkInterval);
    } else if (checkCount >= maxChecks) {
        console.log("Gave up waiting for auth data after multiple attempts");
        clearInterval(checkInterval);

        // Show a message to the user if we're on the auth callback page
        if (window.location.href.includes('auth-callback') && window.location.href.includes('extension=true')) {
            const timeoutElement = document.createElement('div');
            timeoutElement.innerHTML = `
                <div style="padding: 20px; text-align: center; color: #f59e0b;">
                    <h3>Authentication Timeout</h3>
                    <p>Could not retrieve authentication data in a reasonable time.</p>
                    <p>Please try signing in again or refresh this page.</p>
                    <button id="retry-auth" style="margin-top: 10px; padding: 8px 16px; background-color: #f59e0b; color: white; border: none; border-radius: 4px; cursor: pointer;">
                        Try Again
                    </button>
                </div>
            `;

            // Don't replace the entire body, just add to it
            document.body.appendChild(timeoutElement);

            // Add click handler for retry button
            document.getElementById('retry-auth')?.addEventListener('click', () => {
                window.location.reload();
            });
        }
    }
}, 500);

// Also execute immediately in case the data is already available
extractAuthData();

// Note: In the absence of actual integration with the PromptKit app,
// this script would need to be modified to work with the app's auth system.
// The app would need to expose auth data in a way that this script can access. 