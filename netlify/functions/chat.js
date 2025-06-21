// This function handles the chat interaction. It receives context and a user question,
// then uses the Gemini API to generate a context-aware answer.

exports.handler = async function(event, context) {
  // Retrieve the secret Gemini API key from environment variables.
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`;

  try {
    // Get the article context and user message sent from the frontend.
    const { context, userMessage } = JSON.parse(event.body);

    // Construct the detailed and stricter prompt for the AI.
    const prompt = `Du bist ein präziser und faktenbasierter KI-Assistent. Deine einzige Aufgabe ist es, die Frage des Nutzers ausschließlich auf Basis des folgenden Artikelkontexts zu beantworten. Antworte niemals mit Wissen, das außerhalb dieses Kontexts liegt. Wenn die Antwort auf die Frage im Artikel enthalten ist, gib sie präzise wieder. Wenn die Antwort nicht im Artikel zu finden ist, antworte ausschließlich mit dem Satz: "Diese Information ist im vorliegenden Artikel nicht enthalten." Gib keine zusätzlichen Informationen oder Erklärungen. Frage: "${userMessage}". Artikelkontext: ${context}`;

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
