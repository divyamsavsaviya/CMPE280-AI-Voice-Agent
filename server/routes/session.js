const express = require('express');
const router = express.Router();

router.post('/ephemeral-key', async (req, res) => {
  try {
    const body = {
      model: 'gpt-4o-realtime-preview-2024-10-01',
      voice: 'verse',
      instructions: `You are a professional interviewer. 
      Your goal is to conduct a realistic interview. 
      Ask one question at a time. 
      Wait for the candidate to respond. 
      Provide brief, constructive feedback if necessary, but focus on moving the interview forward.
      Do not be overly verbose. Keep it conversational.`,
      input_audio_transcription: {
        model: 'whisper-1',
      },
      turn_detection: {
        type: 'server_vad',
        threshold: 0.5,
        prefix_padding_ms: 300,
        silence_duration_ms: 500,
      }
    };

    const response = await fetch('https://api.openai.com/v1/realtime/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API Error:', response.status, errorText);
      throw new Error(`OpenAI API Error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('Failed to generate ephemeral key:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
