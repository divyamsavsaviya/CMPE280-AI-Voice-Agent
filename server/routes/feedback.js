const express = require('express');
const router = express.Router();


router.post('/analyze', async (req, res) => {
  try {
    const { transcript, role, experienceLevel, jobDescription, resume } = req.body;

    if (!transcript || !Array.isArray(transcript)) {
      return res.status(400).json({ error: 'Valid transcript array is required' });
    }

    // Filter for candidate's speech only to analyze THEIR performance
    // The transcript array likely contains objects with { role: 'user' | 'assistant', content: string }
    // However, for context context, we might want to send the whole conversation but instruct the LLM to grade the 'user'

    const conversationText = transcript.map(t => `${t.role}: ${t.content}`).join('\n');

    const systemPrompt = `
      You are a Precision Interview Coach. Your task is to analyze the following interview transcript and provide a rigorous, structured assessment of the candidate's performance.
      
      role: ${role || 'General'}
      experienceLevel: ${experienceLevel || 'Not specified'}
      
      You must return a strictly valid JSON object (no markdown formatting) with the following schema:
      {
        "confidenceScore": number (0-100), // Deduct for hesitation words ("um", "uh") and weak language ("maybe", "I think").
        "competencyBand": "Beginner" | "Intermediate" | "Advanced", // Evaluate technical depth.
        "starMethod": boolean, // true if the candidate generally followed Situation-Task-Action-Result format for behavioral questions.
        "clarity": number (0-100), // How clear and concise were the answers?
        "knowledgeDepth": number (0-100), // Depth of technical understanding shown.
        "feedbackPoints": [
          {
            "type": "success" | "warning" | "critical",
            "title": string,
            "description": string
          }
        ],
        "coachNote": string // A distinct, actionable tip for the next interview.
      }

      Grading Criteria:
      - Confidence: High penalty for uncertainty markers. High reward for assertive, clear statements.
      - Competency: "Intermediate" or "Advanced" requires mentioning trade-offs, edge cases, or system design implications.
      - Feedback Points: 
        - "success": Specific good practices (e.g. "Great use of STAR").
        - "warning": Minor issues (e.g. "Missed a specific edge case").
        - "critical": Major red flags (e.g. "Complete misunderstanding of concept").
      - Coach Note: One specific, high-impact piece of advice.
    `;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: conversationText }
        ],
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API Error (Grading):', response.status, errorText);
      throw new Error(`OpenAI API Error: ${response.status}`);
    }

    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content);

    res.json(result);

  } catch (err) {
    console.error('Feedback analysis failed:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
