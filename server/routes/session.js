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
      instructions: `You are a professional interviewer conducting an interview for the role of: ${context}.
      ${experienceText}
      ${jdText}
      ${resumeText}
      
      Your goal is to conduct a realistic, role-specific interview that is tailored to the candidate's level and background.
      1. Start by welcoming the candidate to the interview for ${context}.
      2. Ask relevant technical and behavioral questions suited for a ${context} at the ${experienceLevel || 'specified'} level.
      3. Use the provided Resume (if any) to ask about specific projects or skills.
      4. Use the provided Job Description (if any) to align questions with the role requirements.
      5. If a specific company is mentioned in the role (e.g., "Software Engineer at Google"), tailor your questions to that company's known culture and values.
      4. Ask one question at a time.
      5. Wait for the candidate to respond.
      6. Provide brief, constructive feedback if necessary, but focus on moving the interview forward.
      7. Do not be overly verbose. Keep it conversational and professional.`,
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
