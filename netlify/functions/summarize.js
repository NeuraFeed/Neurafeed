// This function receives text from the frontend and uses the Gemini API
// to create a headline, a short summary, a long summary, and keywords.

exports.handler = async function(event, context) {
  // Retrieve the secret Gemini API key from environment variables.
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  // UPDATED: Using a more current and reliable model name.
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`;

  try {
    // Get the title and description sent from the frontend.
    const { title, description } = JSON.parse(event.body);
    const currentText = `${title}. ${description || ''}`;

    // Define the structure (schema) for the desired JSON output from the AI.
    const schema = {
      type: "OBJECT",
      properties: {
          ueberschrift: { type: "STRING", description: "Eine prägnante, sehr kurze Überschrift für den Artikel (max 8 Wörter)." },
          kurze_zusammenfassung: { type: "STRING", description: "Eine sehr kurze Kernaussage von 2-3 Sätzen, die die 4 wichtigsten Schlagwörter enthält." },
          lange_zusammenfassung: { type: "STRING", description: "Eine flüssig lesbare, journalistische Zusammenfassung des Artikels in 3-4 Absätzen, die genug Inhalt für eine längere Sprachausgabe bietet." },
          schlagwoerter: { type: "ARRAY", items: { type: "STRING" }, description: "Die 4 wichtigsten Schlüsselwörter." }
      }
    };

    // Construct the prompt and payload for the Gemini API.
    const systemInstruction = `Analysiere den Nachrichtentext. Gib eine 'ueberschrift', 'kurze_zusammenfassung', 'lange_zusammenfassung' und 4 'schlagwoerter' als JSON zurück. Stelle sicher, dass die Ausgabe valides JSON ist und alle Strings korrekt escaped sind. Text: "${currentText}"`;
    const payload = { 
        contents: [{ role: "user", parts: [{ text: systemInstruction }] }], 
        generationConfig: { responseMimeType: "application/json", responseSchema: schema } 
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
    const text = result.candidates?.[0]?.content?.parts?.[0]?.text;

    // Return the structured JSON from the AI to the frontend.
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: text || "{}"
    };

  } catch (error) {
    console.error('Error in summarize function:', error);
    return { 
        statusCode: 500, 
        body: JSON.stringify({ error: 'Failed to summarize text' }) 
    };
  }
};
