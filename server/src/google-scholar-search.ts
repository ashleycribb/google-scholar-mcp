import axios from 'axios';
import * as cheerio from 'cheerio';

interface ScholarResult {
    Title: string;
    Authors: string;
    Abstract: string;
    URL: string;
}

interface SearchOptions {
    author?: string | null;
    startYear?: number | null;
    endYear?: number | null;
}

/**
 * Searches Google Scholar for academic papers and returns parsed results
 * @param query - The search query string
 * @param numResults - Number of results to return (default: 10)
 * @param options - Additional search filters (author, startYear, endYear)
 * @returns Promise<ScholarResult[]> - Array of search results
 */
export async function searchGoogleScholar(
    query: string, 
    numResults: number = 10,
    options: SearchOptions = {}
): Promise<ScholarResult[]> {
    try {
        const { author = null, startYear = null, endYear = null } = options;
        
        // Build the search query with additional parameters
        let searchQuery = query;
        
        // Add author filter if provided
        if (author) {
            searchQuery += ` author:"${author}"`;
        }
        
        const encodedQuery = encodeURIComponent(searchQuery);
        let url = `https://scholar.google.com/scholar?q=${encodedQuery}&num=${numResults}`;
        
        // Add year range parameters if provided
        if (startYear !== null || endYear !== null) {
            const yearStart = startYear || '';
            const yearEnd = endYear || '';
            url += `&as_ylo=${yearStart}&as_yhi=${yearEnd}`;
        }
        
        // Set headers to mimic a real browser request
        const headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
        };

        const response = await axios.default.get(url, { headers });
        const $ = cheerio.load(response.data);
        
        const results: ScholarResult[] = [];
        
        // Parse each search result
        $('.gs_r.gs_or.gs_scl').each((index, element) => {
            if (results.length >= numResults) return false; // Stop when we have enough results
            
            const $element = $(element);
            
            // Extract title
            const titleElement = $element.find('.gs_rt a');
            const title = titleElement.text().trim() || 'No title available';
            
            // Extract URL
            const url = titleElement.attr('href') || '';
            
            // Extract authors and publication info
            const authorsElement = $element.find('.gs_a');
            const authors = authorsElement.text().trim() || 'No authors available';
            
            // Extract abstract/snippet
            const abstractElement = $element.find('.gs_rs');
            const abstract = abstractElement.text().trim() || 'No abstract available';

            // Only add if we have at least a title
            if (title && title !== 'No title available') {
                results.push({
                    Title: title,
                    Authors: authors,
                    Abstract: abstract,
                    URL: url
                });
            }
        });

        return results;
        
    } catch (error) {
        console.error('Error searching Google Scholar:', error);
        throw new Error(`Failed to search Google Scholar: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

// Example usage with different parameter combinations:
// searchGoogleScholar('machine learning'); // Original usage
// searchGoogleScholar('machine learning', 10, { author: 'Andrew Ng' });
// searchGoogleScholar('machine learning', 10, { startYear: 2020, endYear: 2023 });
// searchGoogleScholar('machine learning', 10, { author: 'Geoffrey Hinton', startYear: 2015, endYear: 2020 });