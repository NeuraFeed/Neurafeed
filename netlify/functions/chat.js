// This function handles the chat interaction. It receives context and a user question,
// then uses the Gemini API to generate a context-aware answer.

exports.handler = async function(event, context) {
  // Retrieve the secret Gemini API key from environment variables.
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  // UPDATED: Using a more current and reliable model name.
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`;

  try {
    // Get the article context and user message sent from the frontend.
    const { context, userMessage } = JSON.parse(event.body);

    // Construct the detailed prompt for the AI.
    const prompt = `Du bist ein KI-Assistent. Beantworte die folgende Frage des Nutzers: "${userMessage}". Deine primäre Wissensquelle ist der folgende Artikel: ${context}. Falls die Antwort im Artikel zu finden ist, gib sie direkt wieder. Falls die Information nicht im Artikel enthalten ist, nutze dein allgemeines Wissen und antworte mit dem Satz: "Diese Information ist nicht direkt in dem Artikel enthalten. Eine Recherche hat jedoch ergeben, dass..." gefolgt von der Antwort.`;

    const payload = { 
        contents: [{ role: "user", parts: [{ text: prompt }] }] 
    };

    // Call the Gemini API using the globally available fetch.
    const response = await fetch(apiUrl, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(payload) 
    });

    if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    const text = result.candidates?.[0]?.content?.parts?.[0]?.text || "Ich konnte leider keine Antwort finden.";

    // Return the AI's response to the frontend.
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: text })
    };

  } catch (error) {
    console.error('Error in chat function:', error);
    return { 
        statusCode: 500, 
        body: JSON.stringify({ error: 'Failed to get chat response' }) 
    };
  }
};
