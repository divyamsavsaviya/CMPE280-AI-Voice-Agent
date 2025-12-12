const express = require('express');
const router = express.Router();

router.post('/ephemeral-key', async (req, res) => {
  try {
    const { role, experienceLevel, jobDescription, resume } = req.body;
    const context = role || 'General Interview';
    const experienceText = experienceLevel ? `Candidate Experience Level: ${experienceLevel}` : '';
    const jdText = jobDescription ? `\nJob Description:\n${jobDescription}` : '';
    const resumeText = resume ? `\nCandidate Resume/Summary:\n${resume}` : '';

    const body = {
      model: 'gpt-4o-realtime-preview',
      voice: 'alloy',
      modalities: ['audio', 'text'],
      instructions: `You are a professional interviewer conducting a "phone screen" interview for the role of: ${context}.
      ${experienceText}
      ${jdText}
      ${resumeText}
      
      Your goal is to conduct a short, 4-question screening interview.
      You MUST strictly follow this exact question sequence:

      1. First Question: Start IMMEDIATELY by welcoming the candidate and asking them to "Tell me a little about yourself".
      2. Second Question: Ask "Tell me about your Distributed Storage System (KV Store) project."
      3. Third Question: Ask "Tell me about your Moth (Federated Microblogging) project."
      4. Fourth Question: Ask "Tell me about a time you faced a challenge in a project or internship and how you handled it."
      
      Rules:
      - Do NOT ask any other questions.
      - Keep your responses concise (under 2 sentences).
      - Do NOT provide feedback during the interview. Just acknowledge the answer and move to the next question.
      - After the 4th question (Challenge/Handling), thank the candidate and say goodbye.
      `,
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
