import asyncio
from playwright.async_api import async_playwright
import os

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        # Inject chrome and fetch mocks
        await page.add_init_script("""
            window.chrome = {
                storage: {
                    local: {
                        get: (key, cb) => cb({ mcpServerUrl: 'http://localhost:3000' }),
                        set: (data) => {}
                    }
                }
            };

            window.fetch = async (url, options) => {
                return {
                    ok: true,
                    json: async () => ({
                        result: {
                            content: [{ text: "Line 1\\nLine 2\\nLine 3" }]
                        }
                    })
                };
            };
        """)

        # Navigate to popup.html
        popup_path = f"file://{os.path.abspath('extension/popup.html')}"
        await page.goto(popup_path)

        # Fill query and click search
        await page.fill('#query', 'test query')
        await page.click('#search')

        # Wait for results
        await page.wait_for_selector('#results', state='visible')

        # Check textContent and innerHTML properties
        # Since we want to use CSS white-space: pre-wrap, innerHTML should contain \n, not <br>
        results_text = await page.locator('#results').text_content()
        results_inner = await page.locator('#results').inner_html()

        print("Results Text:", repr(results_text))
        print("Results Inner HTML:", repr(results_inner))

        # In current state, inner_html contains <br>
        # After fix, inner_html should NOT contain <br> and results_text should contain \n

        await browser.close()

if __name__ == '__main__':
    asyncio.run(main())
