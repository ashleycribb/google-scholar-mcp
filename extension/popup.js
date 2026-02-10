document.addEventListener('DOMContentLoaded', () => {
  // --- DOM Elements ---
  const queryInput = document.getElementById('query-input');
  const searchBtn = document.getElementById('search-btn');
  const searchResultsDiv = document.getElementById('search-results');
  const savedResultsDiv = document.getElementById('saved-list');
  const savedEmptyMsg = document.getElementById('saved-empty');
  const loadingDiv = document.getElementById('loading');
  const errorDiv = document.getElementById('search-error');

  const tabSearch = document.getElementById('tab-search');
  const tabSaved = document.getElementById('tab-saved');
  const viewSearch = document.getElementById('view-search');
  const viewSaved = document.getElementById('view-saved');

  const copyAllBtn = document.getElementById('copy-all-btn');
  const clearAllBtn = document.getElementById('clear-all-btn');

  // --- State ---
  let savedPapers = [];

  // --- Initialization ---
  loadSavedPapers();

  // --- Event Listeners ---

  // Tabs
  tabSearch.addEventListener('click', () => switchTab('search'));
  tabSaved.addEventListener('click', () => switchTab('saved'));

  // Search
  searchBtn.addEventListener('click', performSearch);
  queryInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') performSearch();
  });

  // Saved Actions
  copyAllBtn.addEventListener('click', copySavedPapers);
  clearAllBtn.addEventListener('click', clearAllPapers);

  // --- Functions ---

  function switchTab(tab) {
    if (tab === 'search') {
      tabSearch.classList.add('active');
      tabSaved.classList.remove('active');
      viewSearch.classList.remove('hidden');
      viewSaved.classList.add('hidden');
    } else {
      tabSaved.classList.add('active');
      tabSearch.classList.remove('active');
      viewSaved.classList.remove('hidden');
      viewSearch.classList.add('hidden');
      renderSavedPapers(); // Refresh view
    }
  }

  async function loadSavedPapers() {
    chrome.storage.local.get(['savedPapers'], (result) => {
      savedPapers = result.savedPapers || [];
      renderSavedPapers();
    });
  }

  async function performSearch() {
    const query = queryInput.value.trim();
    if (!query) return;

    // UI Updates
    loadingDiv.classList.remove('hidden');
    searchResultsDiv.innerHTML = '';
    errorDiv.classList.add('hidden');
    searchBtn.disabled = true;

    try {
      const results = await fetchGoogleScholar(query);
      renderSearchResults(results);
    } catch (err) {
      console.error('Search Error:', err);
      errorDiv.textContent = err.message || 'An error occurred while searching.';
      errorDiv.classList.remove('hidden');

      // Specific handling for potential CAPTCHA
      if (err.message.includes('CAPTCHA') || err.message.includes('429')) {
        errorDiv.innerHTML = 'Google Scholar requires verification. <a href="https://scholar.google.com" target="_blank">Open Google Scholar</a> to solve the CAPTCHA, then try again.';
      }
    } finally {
      loadingDiv.classList.add('hidden');
      searchBtn.disabled = false;
    }
  }

  async function fetchGoogleScholar(query) {
    const url = `https://scholar.google.com/scholar?q=${encodeURIComponent(query)}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
      }
    });

    if (!response.ok) {
        if (response.status === 429) {
            throw new Error('Too many requests (CAPTCHA required).');
        }
        throw new Error(`HTTP Error: ${response.status}`);
    }

    const html = await response.text();
    return parseScholarHTML(html);
  }

  function parseScholarHTML(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const results = [];

    const items = doc.querySelectorAll('.gs_r.gs_or.gs_scl');

    items.forEach(item => {
      try {
        const titleEl = item.querySelector('.gs_rt a');
        if (!titleEl) return; // Skip if no link (e.g. citation only)

        const title = titleEl.textContent;
        const url = titleEl.getAttribute('href');

        const authorEl = item.querySelector('.gs_a');
        const authors = authorEl ? authorEl.textContent.replace(/\s+/g, ' ').trim() : 'Unknown Authors';

        const abstractEl = item.querySelector('.gs_rs');
        const abstract = abstractEl ? abstractEl.textContent.replace(/\s+/g, ' ').trim() : '';

        results.push({
          title,
          url,
          authors,
          abstract,
          id: url // Use URL as unique ID
        });
      } catch (e) {
        console.warn('Skipping item due to parse error', e);
      }
    });

    if (results.length === 0) {
        // Check if we hit a captcha page
        if (doc.body.textContent.includes('robot') || doc.querySelector('#captcha')) {
             throw new Error('CAPTCHA required.');
        }
        throw new Error('No results found.');
    }

    return results;
  }

  function renderSearchResults(results) {
    searchResultsDiv.innerHTML = '';

    if (results.length === 0) {
        searchResultsDiv.innerHTML = '<div class="empty-msg">No results found.</div>';
        return;
    }

    results.forEach(paper => {
      const card = createPaperCard(paper, false);
      searchResultsDiv.appendChild(card);
    });
  }

  function renderSavedPapers() {
    savedResultsDiv.innerHTML = '';

    if (savedPapers.length === 0) {
      savedEmptyMsg.classList.remove('hidden');
      copyAllBtn.disabled = true;
      clearAllBtn.disabled = true;
    } else {
      savedEmptyMsg.classList.add('hidden');
      copyAllBtn.disabled = false;
      clearAllBtn.disabled = false;

      savedPapers.forEach(paper => {
        const card = createPaperCard(paper, true);
        savedResultsDiv.appendChild(card);
      });
    }
  }

  function createPaperCard(paper, isSavedView) {
    const div = document.createElement('div');
    div.className = 'paper-card';

    const isAlreadySaved = savedPapers.some(p => p.url === paper.url);
    const escapedUrl = escapeHtml(paper.url);

    div.innerHTML = `
      <a href="${escapedUrl}" class="paper-title" target="_blank">${escapeHtml(paper.title)}</a>
      <div class="paper-authors">${escapeHtml(paper.authors)}</div>
      <div class="paper-abstract">${escapeHtml(paper.abstract)}</div>
      <div class="paper-actions">
        ${isSavedView
          ? `<button class="remove-btn" data-url="${escapedUrl}">Remove</button>`
          : `<button class="save-btn" data-url="${escapedUrl}" ${isAlreadySaved ? 'disabled' : ''}>
              ${isAlreadySaved ? 'Saved' : 'Save'}
             </button>`
        }
      </div>
    `;

    // Attach listeners
    if (isSavedView) {
      div.querySelector('.remove-btn').addEventListener('click', () => removePaper(paper.url));
    } else {
      const saveBtn = div.querySelector('.save-btn');
      if (!isAlreadySaved) {
          saveBtn.addEventListener('click', () => {
              savePaper(paper);
              saveBtn.textContent = 'Saved';
              saveBtn.disabled = true;
          });
      }
    }

    return div;
  }

  function savePaper(paper) {
    if (savedPapers.some(p => p.url === paper.url)) return;

    savedPapers.push(paper);
    chrome.storage.local.set({ savedPapers }, () => {
      // Visual feedback handled by button state
    });
  }

  function removePaper(url) {
    savedPapers = savedPapers.filter(p => p.url !== url);
    chrome.storage.local.set({ savedPapers }, () => {
      renderSavedPapers();
    });
  }

  function clearAllPapers() {
    if (confirm('Are you sure you want to clear all saved papers?')) {
      savedPapers = [];
      chrome.storage.local.set({ savedPapers }, () => {
        renderSavedPapers();
      });
    }
  }

  function copySavedPapers() {
    if (savedPapers.length === 0) return;

    const text = savedPapers.map((p, i) =>
      `${i + 1}. ${p.title}\n   Authors: ${p.authors}\n   URL: ${p.url}\n   Abstract: ${p.abstract}\n`
    ).join('\n');

    navigator.clipboard.writeText(text).then(() => {
      const originalText = copyAllBtn.textContent;
      copyAllBtn.textContent = 'Copied!';
      setTimeout(() => copyAllBtn.textContent = originalText, 2000);
    });
  }

  function escapeHtml(text) {
    if (!text) return '';
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
  }
});
