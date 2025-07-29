import { searchGoogleScholar } from "./google-scholar-search.js";

export const googleScholarTools = [
    {
        name: "search_google_scholar",
        description: "Search Google Scholar for academic papers and research articles. Supports filtering by author, publication year range, and returns structured results with titles, authors, abstracts, and URLs.",
        inputSchema: {
            type: "object",
            properties: {
                query: {
                    type: "string",
                    description: "The search query string (e.g., 'machine learning', 'neural networks')"
                },
                numResults: {
                    type: "number",
                    description: "Number of results to return (default: 10, max: 20)",
                    minimum: 1,
                    maximum: 20,
                    default: 10
                },
                author: {
                    type: "string",
                    description: "Filter results by specific author name (optional)"
                },
                startYear: {
                    type: "number",
                    description: "Filter results from this year onwards (optional)",
                    minimum: 1900,
                    maximum: new Date().getFullYear()
                },
                endYear: {
                    type: "number",
                    description: "Filter results up to this year (optional)",
                    minimum: 1900,
                    maximum: new Date().getFullYear()
                }
            },
            required: ["query"]
        }
    }
]

interface SearchGoogleScholarArgs {
    query: string;
    numResults?: number;
    author?: string;
    startYear?: number;
    endYear?: number;
}

/**
 * MCP tool function that calls searchGoogleScholar and returns formatted results
 * @param args - The arguments passed from the MCP tool call
 * @returns Promise<{ content: Array<{ type: string; text: string }>, isError?: boolean }>
 */
export async function callSearchGoogleScholarTool(args: any): Promise<{
    content: Array<{ type: string; text: string }>;
    isError?: boolean;
}> {
    try {
        // Validate input arguments
        validateSearchGoogleScholarArgs(args);

        const {
            query,
            numResults = 10,
            author = null,
            startYear = null,
            endYear = null
        } = args as SearchGoogleScholarArgs;


        console.log(`Calling Google Scholar search with query: "${query}", numResults: ${numResults}, author: ${author || 'none'}, yearRange: ${startYear || 'any'}-${endYear || 'any'}`);

        // Call the Google Scholar search function
        const results = await searchGoogleScholar(query, numResults, {
            author,
            startYear,
            endYear
        });

        // Create response object using the existing ScholarResult structure
        const response = {
            query: query,
            filters: {
                author: author || "none",
                yearRange: startYear || endYear ? `${startYear || 'any'}-${endYear || 'any'}` : "none"
            },
            totalResults: results.length,
            results: results
        };

        console.log(`Google Scholar search completed. Found ${results.length} results.`);

        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(response, null, 2)
                }
            ]
        };

    } catch (error) {
        console.error("Error in callSearchGoogleScholarTool:", error);
        
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        
        return {
            content: [
                {
                    type: "text",
                    text: `Error searching Google Scholar: ${errorMessage}`
                }
            ],
            isError: true
        };
    }
}

/**
 * Validates the parameters for Google Scholar search
 * @param args - The search arguments to validate
 * @throws Error if validation fails
 */
function validateSearchGoogleScholarArgs(args: SearchGoogleScholarArgs): void {
    const { query, numResults, startYear, endYear } = args;

    // Validate required parameters
    if (!query || typeof query !== 'string') {
        throw new Error("Query parameter is required and must be a string");
    }

    // Validate numResults
    if (numResults && (typeof numResults !== 'number' || numResults < 1 || numResults > 20)) {
        throw new Error("numResults must be a number between 1 and 20");
    }

    // Validate year parameters
    if (startYear && (typeof startYear !== 'number' || startYear < 1900 || startYear > new Date().getFullYear())) {
        throw new Error(`startYear must be a number between 1900 and ${new Date().getFullYear()}`);
    }

    if (endYear && (typeof endYear !== 'number' || endYear < 1900 || endYear > new Date().getFullYear())) {
        throw new Error(`endYear must be a number between 1900 and ${new Date().getFullYear()}`);
    }

    // Validate year range if both are provided
    if (startYear && endYear && startYear > endYear) {
        throw new Error("Start year cannot be greater than end year");
    }
}