document.addEventListener('DOMContentLoaded', () => {
  const queryInput = document.getElementById('query');
  const searchButton = document.getElementById('search');
  const resultsDiv = document.getElementById('results');
  const serverUrlInput = document.getElementById('serverUrl');

  // Load the saved server URL from storage
  chrome.storage.local.get('mcpServerUrl', (data) => {
    if (data.mcpServerUrl) {
      serverUrlInput.value = data.mcpServerUrl;
    }
  });

  searchButton.addEventListener('click', async () => {
    const query = queryInput.value;
    const serverUrl = serverUrlInput.value;

    if (!serverUrl) {
      resultsDiv.textContent = 'Please enter a server URL.';
      return;
    }

    // Save the server URL for next time
    chrome.storage.local.set({ 'mcpServerUrl': serverUrl });

    if (!query) {
      resultsDiv.textContent = 'Please enter a search query.';
      return;
    }

    resultsDiv.textContent = 'Searching...';

    try {
      const response = await fetch(serverUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'callTool',
          params: {
            name: 'search_google_scholar',
            arguments: { query: query },
          },
          id: 1, // Unique ID for the request
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const jsonResponse = await response.json();

      if (jsonResponse.error) {
        throw new Error(jsonResponse.error.message);
      }

      const resultContent = jsonResponse.result?.content?.[0]?.text;

      if (resultContent) {
        resultsDiv.innerHTML = resultContent.replace(/\n/g, '<br>');
      } else {
        resultsDiv.textContent = 'No results found or invalid response format.';
      }

    } catch (error) {
      console.error('Error:', error);
      resultsDiv.textContent = `An error occurred: ${error.message}`;
    }
  });
});
