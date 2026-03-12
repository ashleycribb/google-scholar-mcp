from playwright.sync_api import sync_playwright
import os

def run(playwright):
    browser = playwright.chromium.launch()
    page = browser.new_page()

    # Mock chrome API and fetch
    mock_script = """
    window.chrome = {
        storage: {
            local: {
                get: (key, callback) => {
                    callback({ mcpServerUrl: 'http://localhost:3000' });
                },
                set: (data) => {}
            }
        }
    };

    window.fetch = async (url, options) => {
        return {
            ok: true,
            json: async () => ({
                result: {
                    content: [
                        { text: 'Mock Line 1\\nMock Line 2' }
                    ]
                }
            })
        };
    };
    """
    page.add_init_script(mock_script)

    # Load popup.html
    current_dir = os.path.dirname(os.path.abspath(__file__))
    file_url = f"file://{current_dir}/extension/popup.html"
    page.goto(file_url)

    # Fill query and click search
    page.fill('#query', 'test query')
    page.click('#search')

    # Wait for result
    page.wait_for_selector('#results')

    # Assert result content
    results_text = page.locator('#results').text_content()

    if "Mock Line 1\nMock Line 2" in results_text:
        print("Test passed: Content displayed correctly.")
    else:
        print(f"Test failed: Expected content not found. Found: {results_text}")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
