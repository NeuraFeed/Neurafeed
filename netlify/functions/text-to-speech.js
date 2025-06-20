// This function converts text to high-quality speech using Google's premium Text-to-Speech API.

exports.handler = async function(event, context) {
  // Retrieve the secret Gemini/Google Cloud API key from environment variables.
  const API_KEY = process.env.GEMINI_API_KEY;
  const apiUrl = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${API_KEY}`;

  try {
    // Get the text to be synthesized from the frontend request.
    const { text } = JSON.parse(event.body);

    if (!text) {
        return { statusCode: 400, body: JSON.stringify({ error: 'No text provided.' }) };
    }

    // Construct the request payload for the Text-to-Speech API.
    // We are using a high-quality, premium "Studio" voice for the best result.
    const payload = {
      input: {
        text: text,
      },
      voice: {
        languageCode: 'de-DE',
        name: 'de-DE-Studio-C', // A premium, female studio-quality voice.
      },
      audioConfig: {
        audioEncoding: 'MP3',
      },
    };

    // Call the Google Cloud Text-to-Speech API.
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      // If the API call fails, log the error and return a server error.
      const errorBody = await response.text();
      console.error('Google TTS API Error:', errorBody);
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    
    // The API returns the audio data as a Base64 encoded string.
    // We return this to the frontend.
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(result), // The body now contains { audioContent: "..." }
    };

  } catch (error) {
    console.error('Error in text-to-speech function:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to generate speech.' }),
    };
  }
};
