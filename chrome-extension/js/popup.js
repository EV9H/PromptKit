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
let activeFilters = {
    created: ['all'],
    liked: ['all']
};
let filterOptions = {
    folders: [],
    categories: []
};
let allPrompts = {
    created: [],
    liked: []
};

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
        console.log('Starting to fetch prompts...');

        // First fetch prompts
        await fetchCreatedPrompts();
        await fetchLikedPrompts();

        // Then fetch filter options (this will use prompt data if API fails)
        await fetchFilterOptions();
    } catch (error) {
        console.error('Error fetching prompts:', error);
        showError('created', 'Failed to load prompts. Please try again.');
        showError('liked', 'Failed to load prompts. Please try again.');
    }
}

async function fetchFilterOptions() {
    try {
        console.log('Fetching filter options...');

        // Try to fetch from API
        let data;
        try {
            const response = await fetch(`${API_BASE_URL}/api/extension/filter-options`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });

            if (!response.ok) {
                throw new Error(`Error fetching filter options: ${response.status}`);
            }

            data = await response.json();
            console.log('Filter options received:', data);
        } catch (apiError) {
            console.error('API error:', apiError);
            // If API fails, use fallback data
            console.log('Using fallback filter options');
            data = {
                folders: [],
                categories: []
            };

            // Get unique categories from existing prompts
            const allCategories = new Set();

            // Extract categories from created prompts
            if (allPrompts.created && allPrompts.created.length > 0) {
                allPrompts.created.forEach(prompt => {
                    if (prompt.category_id && prompt.category_name) {
                        allCategories.add(JSON.stringify({
                            id: prompt.category_id,
                            name: prompt.category_name
                        }));
                    }
                });
            }

            // Extract categories from liked prompts
            if (allPrompts.liked && allPrompts.liked.length > 0) {
                allPrompts.liked.forEach(prompt => {
                    if (prompt.category_id && prompt.category_name) {
                        allCategories.add(JSON.stringify({
                            id: prompt.category_id,
                            name: prompt.category_name
                        }));
                    }
                });
            }

            // If we still don't have any categories, add some test ones
            if (allCategories.size === 0) {
                console.log('No categories found in prompts, adding simulated categories');
                data.categories = [
                    { id: 'test1', name: 'Writing' },
                    { id: 'test2', name: 'Coding' },
                    { id: 'test3', name: 'Marketing' }
                ];

                data.folders = [
                    { id: 'folder1', name: 'Personal' },
                    { id: 'folder2', name: 'Work' }
                ];
            } else {
                // Convert from Set to array
                data.categories = Array.from(allCategories).map(cat => JSON.parse(cat));
            }

            console.log('Generated fallback categories:', data.categories);
        }

        // Update filter options
        filterOptions.folders = data.folders || [];
        filterOptions.categories = data.categories || [];

        console.log('Final filter options:', filterOptions);

        // Create filter UI for both tabs
        createFilterUI('created');
        createFilterUI('liked');
    } catch (error) {
        console.error('Error handling filter options:', error);
    }
}

async function fetchCreatedPrompts() {
    try {
        console.log('Fetching created prompts...');
        const response = await fetch(`${API_BASE_URL}/api/extension/prompts/created`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();
        console.log(`Received ${data.prompts?.length || 0} created prompts`);

        // Store all prompts
        allPrompts.created = data.prompts || [];

        // If no prompts and we're in development, add some mock data
        if (allPrompts.created.length === 0 && API_BASE_URL.includes('localhost')) {
            console.log('No created prompts found, adding mock data for development');
            allPrompts.created = [
                {
                    id: 'mock1',
                    title: 'Mock Created Prompt 1',
                    description: 'This is a mock prompt for testing',
                    category_id: 'test1',
                    category_name: 'Writing',
                    folder_id: 'folder1'
                },
                {
                    id: 'mock2',
                    title: 'Mock Created Prompt 2',
                    description: 'Another mock prompt',
                    category_id: 'test2',
                    category_name: 'Coding',
                    folder_id: 'folder2'
                }
            ];
        }

        // Display with current filters
        applyFiltersAndDisplay('created');
    } catch (error) {
        console.error('Error fetching created prompts:', error);

        // Add mock data if we're in development environment
        if (API_BASE_URL.includes('localhost')) {
            console.log('Error fetching prompts, adding mock data for development');
            allPrompts.created = [
                {
                    id: 'mock1',
                    title: 'Mock Created Prompt 1',
                    description: 'This is a mock prompt for testing',
                    category_id: 'test1',
                    category_name: 'Writing',
                    folder_id: 'folder1'
                },
                {
                    id: 'mock2',
                    title: 'Mock Created Prompt 2',
                    description: 'Another mock prompt',
                    category_id: 'test2',
                    category_name: 'Coding',
                    folder_id: 'folder2'
                }
            ];
            applyFiltersAndDisplay('created');
        } else {
            showError('created', 'Failed to load your prompts. Please try again.');
        }
    }
}

async function fetchLikedPrompts() {
    try {
        console.log('Fetching liked prompts...');
        const response = await fetch(`${API_BASE_URL}/api/extension/prompts/liked`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();
        console.log(`Received ${data.prompts?.length || 0} liked prompts`);

        // Store all prompts
        allPrompts.liked = data.prompts || [];

        // If no prompts and we're in development, add some mock data
        if (allPrompts.liked.length === 0 && API_BASE_URL.includes('localhost')) {
            console.log('No liked prompts found, adding mock data for development');
            allPrompts.liked = [
                {
                    id: 'mock3',
                    title: 'Mock Liked Prompt 1',
                    description: 'This is a liked mock prompt',
                    category_id: 'test2',
                    category_name: 'Coding',
                    folder_id: 'folder1'
                },
                {
                    id: 'mock4',
                    title: 'Mock Liked Prompt 2',
                    description: 'Another liked mock prompt',
                    category_id: 'test3',
                    category_name: 'Marketing',
                    folder_id: 'folder2'
                }
            ];
        }

        // Display with current filters
        applyFiltersAndDisplay('liked');
    } catch (error) {
        console.error('Error fetching liked prompts:', error);

        // Add mock data if we're in development environment
        if (API_BASE_URL.includes('localhost')) {
            console.log('Error fetching prompts, adding mock data for development');
            allPrompts.liked = [
                {
                    id: 'mock3',
                    title: 'Mock Liked Prompt 1',
                    description: 'This is a liked mock prompt',
                    category_id: 'test2',
                    category_name: 'Coding',
                    folder_id: 'folder1'
                },
                {
                    id: 'mock4',
                    title: 'Mock Liked Prompt 2',
                    description: 'Another liked mock prompt',
                    category_id: 'test3',
                    category_name: 'Marketing',
                    folder_id: 'folder2'
                }
            ];
            applyFiltersAndDisplay('liked');
        } else {
            showError('liked', 'Failed to load your liked prompts. Please try again.');
        }
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
        // Make the card clickable for copying, but ignore clicks on the menu
        card.addEventListener('click', (e) => {
            // Don't copy if clicking on the menu or menu items
            if (!e.target.closest('.card-menu')) {
                copyPromptContent(card.dataset.promptId);
            }
        });

        // Three-dot menu toggle
        const menuButton = card.querySelector('.three-dot-menu');
        const menuDropdown = card.querySelector('.menu-dropdown');

        menuButton.addEventListener('click', (e) => {
            e.stopPropagation();
            // Close all other open menus
            document.querySelectorAll('.menu-dropdown.active').forEach(menu => {
                if (menu !== menuDropdown) menu.classList.remove('active');
            });
            // Toggle this menu
            menuDropdown.classList.toggle('active');
        });

        // Handle menu item clicks
        card.querySelector('.view-detail').addEventListener('click', (e) => {
            e.stopPropagation();
            viewPromptDetail(e.target.dataset.promptId);
        });

        card.querySelector('.edit-prompt').addEventListener('click', (e) => {
            e.stopPropagation();
            editPrompt(e.target.dataset.promptId);
        });
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.card-menu')) {
            document.querySelectorAll('.menu-dropdown.active').forEach(menu => {
                menu.classList.remove('active');
            });
        }
    });
}

function createPromptCard(prompt) {
    // Check if the current user is the owner of this prompt
    // userId is already set globally from chrome.storage.local
    const isOwner = prompt.user_id === userId;

    return `
    <div class="prompt-card" data-prompt-id="${prompt.id}">
        <div class="prompt-header">
            <div class="prompt-title">${escapeHTML(prompt.title)}</div>
            <div class="card-menu">
                <div class="three-dot-menu">⋮</div>
                <div class="menu-dropdown">
                    <div class="menu-item view-detail" data-prompt-id="${prompt.id}">View Details</div>
                    <div class="menu-item edit-prompt" data-prompt-id="${prompt.id}">${isOwner ? 'Edit Prompt' : 'Customize Prompt'}</div>
                </div>
            </div>
        </div>
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

function viewPromptDetail(promptId) {
    // Open the prompt detail page in a new tab
    chrome.tabs.create({ url: `${API_BASE_URL}/prompts/${promptId}` });
}

function editPrompt(promptId) {
    // Open the prompt edit page in a new tab, our new endpoint will handle ownership checks
    chrome.tabs.create({ url: `${API_BASE_URL}/prompts/${promptId}/edit` });
}

function createFilterUI(tabName) {
    console.log(`Creating filter UI for ${tabName} tab`);
    const tabElement = document.getElementById(tabName);

    if (!tabElement) {
        console.error(`Tab element '${tabName}' not found`);
        return;
    }

    // Create filter container if it doesn't exist
    let filterContainer = tabElement.querySelector('.filter-container');
    if (!filterContainer) {
        console.log(`Creating new filter container for ${tabName}`);
        filterContainer = document.createElement('div');
        filterContainer.className = 'filter-container';

        // Insert filter container at the beginning of the tab content
        tabElement.prepend(filterContainer);
    } else {
        console.log(`Using existing filter container for ${tabName}`);
    }

    // Clear existing filters
    filterContainer.innerHTML = '';

    // Add "All" filter
    const allFilter = document.createElement('div');
    allFilter.className = 'filter-badge active';
    allFilter.dataset.filter = 'all';
    allFilter.dataset.type = 'all';
    allFilter.textContent = 'All';
    filterContainer.appendChild(allFilter);

    // Debug log filter options
    console.log(`Folders for ${tabName}:`, filterOptions.folders);
    console.log(`Categories for ${tabName}:`, filterOptions.categories);

    // Add folder filters
    if (filterOptions.folders && filterOptions.folders.length > 0) {
        console.log(`Adding ${filterOptions.folders.length} folder filters`);
        filterOptions.folders.forEach(folder => {
            const folderFilter = document.createElement('div');
            folderFilter.className = 'filter-badge';
            folderFilter.dataset.filter = folder.id;
            folderFilter.dataset.type = 'folder';
            folderFilter.textContent = folder.name;
            filterContainer.appendChild(folderFilter);
        });
    } else {
        console.log('No folder filters to add');
    }

    // Add category filters
    if (filterOptions.categories && filterOptions.categories.length > 0) {
        console.log(`Adding ${filterOptions.categories.length} category filters`);
        filterOptions.categories.forEach(category => {
            const categoryFilter = document.createElement('div');
            categoryFilter.className = 'filter-badge';
            categoryFilter.dataset.filter = category.id;
            categoryFilter.dataset.type = 'category';
            categoryFilter.textContent = category.name;
            filterContainer.appendChild(categoryFilter);
        });
    } else {
        console.log('No category filters to add');
    }

    // Add event listeners to filter badges
    const badges = filterContainer.querySelectorAll('.filter-badge');
    console.log(`Adding event listeners to ${badges.length} filter badges`);
    badges.forEach(badge => {
        badge.addEventListener('click', () => {
            handleFilterClick(tabName, badge);
        });
    });

    // Make sure the filter container is visible
    filterContainer.style.display = 'flex';
    console.log(`Filter UI for ${tabName} created with ${badges.length} filters`);
}

function handleFilterClick(tabName, badge) {
    const filterType = badge.dataset.type;
    const filterId = badge.dataset.filter;

    // Handle "All" filter specially
    if (filterType === 'all') {
        // If All is being deactivated and no other filters are active, don't allow it
        if (badge.classList.contains('active') && activeFilters[tabName].length === 1) {
            return;
        }

        // Clear all filters if All is clicked
        document.querySelectorAll(`#${tabName} .filter-badge`).forEach(b => {
            b.classList.remove('active');
        });
        badge.classList.add('active');
        activeFilters[tabName] = ['all'];
    } else {
        // Remove "All" filter if another filter is selected
        const allBadge = document.querySelector(`#${tabName} .filter-badge[data-type="all"]`);
        if (allBadge.classList.contains('active')) {
            allBadge.classList.remove('active');
            activeFilters[tabName] = [];
        }

        // Toggle the clicked filter
        if (badge.classList.contains('active')) {
            badge.classList.remove('active');
            activeFilters[tabName] = activeFilters[tabName].filter(id => id !== filterId);

            // If no filters are active, activate "All"
            if (activeFilters[tabName].length === 0) {
                allBadge.classList.add('active');
                activeFilters[tabName] = ['all'];
            }
        } else {
            badge.classList.add('active');
            activeFilters[tabName].push(filterId);
        }
    }

    // Apply the new filters
    applyFiltersAndDisplay(tabName);
}

function applyFiltersAndDisplay(tabName) {
    console.log(`Applying filters for ${tabName}: `, activeFilters[tabName]);
    const filteredPrompts = filterPrompts(tabName);
    console.log(`Filtered from ${allPrompts[tabName].length} to ${filteredPrompts.length} prompts`);
    displayPrompts(tabName, filteredPrompts);
}

function filterPrompts(tabName) {
    // If "All" is selected, return all prompts
    if (activeFilters[tabName].includes('all')) {
        return allPrompts[tabName];
    }

    // Otherwise, filter based on selected filters
    return allPrompts[tabName].filter(prompt => {
        // Check if prompt belongs to any selected folder
        const matchesFolder = filterOptions.folders.some(folder =>
            activeFilters[tabName].includes(folder.id) &&
            prompt.folder_id === folder.id
        );

        // Check if prompt belongs to any selected category
        const matchesCategory = filterOptions.categories.some(category =>
            activeFilters[tabName].includes(category.id) &&
            prompt.category_id === category.id
        );

        // Prompt passes filter if it matches any selected folder or category
        return matchesFolder || matchesCategory;
    });
}