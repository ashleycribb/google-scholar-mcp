import os
from playwright.sync_api import sync_playwright

def verify_extension():
    # Construct the absolute path to the local popup.html
    current_dir = os.path.dirname(os.path.abspath(__file__))
    extension_dir = os.path.join(current_dir, "extension")
    html_path = os.path.join(extension_dir, "popup.html")
    file_url = f"file://{html_path}"

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        # Inject the mock for chrome.storage and window.fetch before the page loads
        page.add_init_script("""
            // Mock chrome API
            window.chrome = {
                storage: {
                    local: {
                        get: (keys, callback) => {
                            if (callback) callback({ mcpServerUrl: 'http://localhost:3000/mcp' });
                        },
                        set: (data, callback) => {
                            if (callback) callback();
                        }
                    }
                }
            };

            // Mock fetch API to return a consistent response
            window.originalFetch = window.fetch;
            window.fetch = async (...args) => {
                const url = args[0];
                if (url === 'http://localhost:3000/mcp') {
                    // Simulate a delay
                    await new Promise(r => setTimeout(r, 500));
                    return {
                        ok: true,
                        json: async () => ({
                            result: {
                                content: [{
                                    text: "Title: A very important paper\\nAuthors: John Doe\\nAbstract: This paper explores the performance of various DOM manipulation techniques. It finds that direct assignment is much faster than string replacement.\\nUrl: https://example.com/paper"
                                }]
                            }
                        })
                    };
                }
                return window.originalFetch(...args);
            };
        """)

        # Navigate to the local file URL
        page.goto(file_url)

        # Wait for the DOM to be ready and populate fields
        page.wait_for_selector("#query")

        # Ensure the server URL is populated by our mock
        server_url_input = page.locator("#serverUrl")
        server_url_input.wait_for()

        # Type a query
        query_input = page.locator("#query")
        query_input.fill("performance DOM manipulation")

        # Click the search button
        search_button = page.locator("#search")
        search_button.click()

        # Wait for the results to appear. Our mock simulates a 500ms delay and returns a specific string.
        page.wait_for_selector("text=A very important paper")

        # Take a screenshot
        os.makedirs("/home/jules/verification", exist_ok=True)
        screenshot_path = "/home/jules/verification/extension_screenshot.png"
        page.screenshot(path=screenshot_path)
        print(f"Screenshot saved to {screenshot_path}")

        browser.close()

if __name__ == "__main__":
    verify_extension()
