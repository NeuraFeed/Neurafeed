// This function fetches the latest news from the GNews API.
// It uses the GNEWS_API_KEY securely stored in Netlify's environment variables.

exports.handler = async function(event, context) {
  // Retrieve the secret API key from environment variables.
  const GNEWS_API_KEY = process.env.GNEWS_API_KEY;
  const gnewsApiUrl = `https://gnews.io/api/v4/top-headlines?token=${GNEWS_API_KEY}&lang=de&country=de&max=10`;

  try {
    // The 'fetch' command is available globally in Netlify's environment.
    const response = await fetch(gnewsApiUrl);
    if (!response.ok) {
        // If the API returns an error, pass it along.
        return { statusCode: response.status, body: response.statusText };
    }
    const data = await response.json();
    
    // Return the fetched data to the frontend.
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    };
  } catch (error) {
    // Handle network errors or other issues.
    console.error('Error fetching news:', error);
    return { 
      statusCode: 500, 
      body: JSON.stringify({ error: 'Failed to fetch news' }) 
    };
  }
};
