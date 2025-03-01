# PromptKit Chrome Extension

This Chrome extension allows you to access your PromptKit prompts directly from your browser. You can view your created prompts and liked prompts, and copy them with a single click.

## Features

- Access your PromptKit account
- View your created prompts
- View your liked/saved prompts
- Copy prompts with a single click
- Quick access to the main PromptKit application

## Installation

### Developer Mode Installation

1. Clone this repository or download the source code
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in the top-right corner)
4. Click "Load unpacked" and select the `chrome-extension` folder from this repository
5. The extension should now be installed and visible in your Chrome toolbar

### Configuration

Before using the extension, you need to configure it to connect to your PromptKit instance:

1. If you're running PromptKit locally, make sure it's running on port 3000
2. If you're using a hosted version, update the `API_BASE_URL` in `js/popup.js` to point to your instance

## API Integration Requirements

For this extension to work properly, the PromptKit application needs to implement the following API endpoints:

- `/api/extension/prompts/created` - Returns the user's created prompts
- `/api/extension/prompts/liked` - Returns the user's liked prompts
- Authentication system that supports the extension callback

### Authentication Flow

The extension uses a browser redirect flow for authentication:

1. User clicks "Sign In" in the extension
2. A new tab opens with the PromptKit sign-in page
3. After successful authentication, the user is redirected to the auth-callback page
4. The callback page should expose auth data to the extension
5. The extension extracts the auth data and stores it for future API calls

## Development

### Required API Endpoints

To implement the API endpoints in your PromptKit application, add the following routes:

1. `/api/extension/prompts/created` - Returns the user's created prompts
2. `/api/extension/prompts/liked` - Returns the user's liked prompts
3. Auth callback endpoint that exposes authentication data to the extension

### Testing

1. Make changes to the code
2. Go to `chrome://extensions/`
3. Click the refresh icon on the PromptKit extension card
4. Test your changes

## Troubleshooting

- **Authentication Issues**: Make sure your PromptKit instance is properly configured with authentication
- **No Prompts Displayed**: Check that the API endpoints are working correctly
- **Extension Not Loading**: Try reloading the extension in developer mode

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This extension is licensed under the same license as the main PromptKit application. 