// Configuration
const API_BASE_URL = 'http://localhost:3000'; // Change to your production URL when deploying

// DOM Elements
const authButton = document.getElementById('auth-button');
const usernameElement = document.getElementById('username');
const loginMessage = document.getElementById('login-message');
const createdTab = document.getElementById('created');
const likedTab = document.getElementById('liked');
const tabButtons = document.querySelectorAll('.tab-btn');
const openAppLink = document.getElementById('open-app');

// State
let isAuthenticated = false;
let authToken = null;
let userId = null;

// Initialize the popup
document.addEventListener('DOMContentLoaded', initializePopup);

async function initializePopup() {
    // Try to get auth token from storage
    chrome.storage.local.get(['authToken', 'userId', 'username'], async (result) => {
        if (result.authToken) {
            authToken = result.authToken;
            userId = result.userId;

            // Validate the token
            const isValid = await validateToken(authToken);

            if (isValid) {
                isAuthenticated = true;
                updateUIForAuthenticatedUser(result.username || 'User');
                fetchPrompts();
            } else {
                // Token expired, clear storage
                chrome.storage.local.remove(['authToken', 'userId', 'username']);
                updateUIForUnauthenticatedUser();
            }
        } else {
            updateUIForUnauthenticatedUser();
        }
    });

    // Set up event listeners
    authButton.addEventListener('click', handleAuthButtonClick);
    tabButtons.forEach(button => {
        button.addEventListener('click', () => switchTab(button.dataset.tab));
    });
    openAppLink.addEventListener('click', openMainApp);
}

// Listen for auth updates from the background script
chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'AUTH_UPDATED' && message.isAuthenticated) {
        // Update state
        isAuthenticated = true;

        // Reload auth data from storage to ensure we have the latest
        chrome.storage.local.get(['authToken', 'userId', 'username'], (result) => {
            authToken = result.authToken;
            userId = result.userId;

            // Update the UI
            updateUIForAuthenticatedUser(result.username || message.username || 'User');

            // Fetch prompts with the new auth token
            fetchPrompts();
        });
    }
});

// Authentication functions
async function validateToken(token) {
    try {
        // In a real implementation, make an API call to validate the token
        // For now, we'll just check if a token exists
        return !!token;
    } catch (error) {
        console.error('Error validating token:', error);
        return false;
    }
}

function handleAuthButtonClick() {
    if (isAuthenticated) {
        // Handle sign out
        chrome.storage.local.remove(['authToken', 'userId', 'username']);
        isAuthenticated = false;
        authToken = null;
        userId = null;
        updateUIForUnauthenticatedUser();
    } else {
        // Handle sign in
        openSignInTab();
    }
}

function openSignInTab() {
    const authUrl = `${API_BASE_URL}/sign-in?callbackUrl=${encodeURIComponent(`${API_BASE_URL}/auth-callback?extension=true`)}`;
    chrome.tabs.create({ url: authUrl });
}

// UI update functions
function updateUIForAuthenticatedUser(username) {
    usernameElement.textContent = username;
    authButton.textContent = 'Sign Out';
    loginMessage.style.display = 'none';
    createdTab.style.display = 'block';
    createdTab.querySelector('.loading').style.display = 'block';
    likedTab.querySelector('.loading').style.display = 'block';
}

function updateUIForUnauthenticatedUser() {
    usernameElement.textContent = 'Not signed in';
    authButton.textContent = 'Sign In';
    loginMessage.style.display = 'block';
    createdTab.style.display = 'none';
    likedTab.style.display = 'none';
}

function switchTab(tabName) {
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
        tab.style.display = 'none';
    });

    // Show the selected tab content
    const selectedTab = document.getElementById(tabName);
    selectedTab.classList.add('active');
    selectedTab.style.display = 'block';

    // Update tab buttons
    tabButtons.forEach(button => {
        button.classList.remove('active');
        if (button.dataset.tab === tabName) {
            button.classList.add('active');
        }
    });
}

function openMainApp() {
    chrome.tabs.create({ url: API_BASE_URL });
}

// Fetch prompts
async function fetchPrompts() {
    if (!isAuthenticated) return;

    try {
        // Fetch created prompts
        fetchCreatedPrompts();

        // Fetch liked prompts
        fetchLikedPrompts();
    } catch (error) {
        console.error('Error fetching prompts:', error);
        showError('created', 'Failed to load prompts. Please try again.');
        showError('liked', 'Failed to load prompts. Please try again.');
    }
}

async function fetchCreatedPrompts() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/extension/prompts/created`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();
        displayPrompts('created', data.prompts);
    } catch (error) {
        console.error('Error fetching created prompts:', error);
        showError('created', 'Failed to load your prompts. Please try again.');
    }
}

async function fetchLikedPrompts() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/extension/prompts/liked`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();
        displayPrompts('liked', data.prompts);
    } catch (error) {
        console.error('Error fetching liked prompts:', error);
        showError('liked', 'Failed to load your liked prompts. Please try again.');
    }
}

function displayPrompts(tabName, prompts) {
    const tabElement = document.getElementById(tabName);
    const promptListElement = tabElement.querySelector('.prompt-list');
    const loadingElement = tabElement.querySelector('.loading');

    // Hide loading indicator
    loadingElement.style.display = 'none';

    if (!prompts || prompts.length === 0) {
        promptListElement.innerHTML = `<div class="content-area">No ${tabName} prompts found.</div>`;
        return;
    }

    // Create prompt cards
    promptListElement.innerHTML = prompts.map(prompt => createPromptCard(prompt)).join('');

    // Add event listeners to prompt cards
    promptListElement.querySelectorAll('.prompt-card').forEach(card => {
        card.addEventListener('click', () => copyPromptContent(card.dataset.promptId));
    });
}

function createPromptCard(prompt) {
    return `
    <div class="prompt-card" data-prompt-id="${prompt.id}">
        <div class="prompt-title">${escapeHTML(prompt.title)}</div>
        <div class="prompt-description">${escapeHTML(prompt.description || '')}</div>
        <div class="prompt-metadata">
            ${prompt.category_name ? `<span class="prompt-category">${escapeHTML(prompt.category_name)}</span>` : ''}
            <span class="prompt-copy-hint">Click to copy</span>
        </div>
    </div>
  `;
}

async function copyPromptContent(promptId) {
    try {
        const promptCard = document.querySelector(`.prompt-card[data-prompt-id="${promptId}"]`);
        if (promptCard) {
            // Add a visual indicator that the card is being copied
            promptCard.classList.add('copying');
        }

        const response = await fetch(`${API_BASE_URL}/api/prompts/${promptId}`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();

        if (data.content) {
            await navigator.clipboard.writeText(data.content);

            // Increment copy count
            fetch(`${API_BASE_URL}/api/prompts/${promptId}/copy`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            }).catch(err => console.error('Error incrementing copy count:', err));

            // Show success UI feedback
            showToast('Copied to clipboard!');

            // Visual feedback on the card
            if (promptCard) {
                promptCard.classList.remove('copying');
                promptCard.classList.add('copied');

                // Reset after animation
                setTimeout(() => {
                    promptCard.classList.remove('copied');
                }, 1500);
            }
        }
    } catch (error) {
        console.error('Error copying prompt:', error);
        showToast('Failed to copy prompt', true);

        // Remove copying state if there was an error
        const promptCard = document.querySelector(`.prompt-card[data-prompt-id="${promptId}"]`);
        if (promptCard) {
            promptCard.classList.remove('copying');
        }
    }
}

function showError(tabName, message) {
    const tabElement = document.getElementById(tabName);
    const errorElement = tabElement.querySelector('.error-message');
    const loadingElement = tabElement.querySelector('.loading');

    loadingElement.style.display = 'none';
    errorElement.textContent = message;
    errorElement.style.display = 'block';
}

function showToast(message, isError = false) {
    // Create toast element if it doesn't exist
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        document.body.appendChild(toast);
    }

    // Set toast style and content
    toast.style.backgroundColor = isError ? 'var(--error-color)' : 'var(--success-color)';
    toast.textContent = message;

    // Add visible class to trigger animation
    toast.classList.add('visible');

    // Hide after 3 seconds
    setTimeout(() => {
        toast.classList.remove('visible');
    }, 3000);
}

// Utility functions
function escapeHTML(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
} 