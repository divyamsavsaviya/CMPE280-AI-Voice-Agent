const express = require('express');
const router = express.Router();


router.post('/analyze', async (req, res) => {
  try {
    const { transcript, role, experienceLevel, jobDescription, resume } = req.body;

    if (!transcript || !Array.isArray(transcript)) {
      console.error('Invalid transcript received:', transcript);
      return res.status(400).json({ error: 'Valid transcript array is required' });
    }

    // console.log('Received transcript length:', transcript.length);
    // if (transcript.length > 0) {
    //   console.log('First transcript item:', JSON.stringify(transcript[0]));
    // }

    // NORMALIZE TRANSCRIPT: Client might send 'text' or 'content'
    const normalizedTranscript = transcript.map(t => ({
      role: t.role,
      content: t.content || t.text || ''
    }));

    // GROUP MESSAGES: Merge consecutive messages from same speaker
    const groupedTranscript = [];
    if (normalizedTranscript.length > 0) {
      let currentGroup = { ...normalizedTranscript[0] };

      for (let i = 1; i < normalizedTranscript.length; i++) {
        const nextMsg = normalizedTranscript[i];
        if (nextMsg.role === currentGroup.role) {
          currentGroup.content += ' ' + nextMsg.content;
        } else {
          groupedTranscript.push(currentGroup);
          currentGroup = { ...nextMsg };
        }
      }
      groupedTranscript.push(currentGroup);
    }

    // Filter for candidate's speech only to analyze THEIR performance
    // The transcript array likely contains objects with { role: 'user' | 'assistant', content: string }
    const userSpeech = groupedTranscript.filter(t => t.role === 'user' && typeof t.content === 'string' && t.content.trim().length > 0);

    if (userSpeech.length === 0) {
      return res.status(400).json({
        error: 'insufficient_data',
        message: 'No candidate speech detected. Please speak clearly into the microphone.'
      });
    }

    const conversationText = groupedTranscript.map(t => `${t.role}: ${t.content}`).join('\n');

    const systemPrompt = `
      You are a Precision Interview Coach. Your task is to analyze the following interview transcript and provide a rigorous, structured assessment of the candidate's performance.
      
      role: ${role || 'General'}
      experienceLevel: ${experienceLevel || 'Not specified'}

      IMPORTANT: If the transcript provided contains NO meaningful answers from the candidate (or only very short/empty greetings), return the following JSON exactly:
      {
        "error": "insufficient_data"
      }
      
      Otherwise, for a valid interview, you must return a strictly valid JSON object (no markdown formatting) with the following schema:
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
        "coachNote": string, // A distinct, actionable tip for the next interview.
        "annotatedConversation": [ // ARRAY of chat messages
           { "role": "user" | "assistant", "content": "string with <mark> tags" }
        ]
      }

      Annotated Conversation Rules:
      - Return the FULL conversation history as an array of objects.
      - Each object must have a 'role' and 'content'.
      - Inside the 'content' string, YOU MUST wrap specific candidate words/phrases in <mark> tags if they meet criteria.
      - <mark type="filler">um</mark> -> For hesitation words (um, uh, like, so...).
      - <mark type="weak" suggestion="better_word">weak_word</mark> -> For weak or passive vocabulary. Example: <mark type="weak" suggestion="spearheaded">led</mark>.
      - <mark type="critical" suggestion="correction">error_phrase</mark> -> For serious factual or technical errors.
      - DO NOT mark the interviewer's (assistant) text, only the candidate's (user).
      - BE AGGRESSIVE with filler/weak word detection to ensure the user sees valid feedback. If they say "like" or "um", mark it.

      Example of expected JSON output for 'annotatedConversation':
      "annotatedConversation": [
         { "role": "assistant", "content": "Tell me about yourself." },
         { "role": "user", "content": "Well, <mark type=\"filler\">um</mark>, I <mark type=\"weak\" suggestion=\"believe\">think</mark> I am a developer." }
      ]

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
    const generatedJSON = data.choices[0].message.content;

    // console.log('--- RAW LLM RESPONSE ---');
    // console.log(generatedJSON);
    // console.log('------------------------');

    let result;
    try {
      result = JSON.parse(generatedJSON);
    } catch (e) {
      console.error("JSON Parse Error:", e);
      // Fallback: try to find JSON block if markdown fences were used
      const jsonMatch = generatedJSON.match(/```json\n([\s\S]*?)\n```/) || generatedJSON.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          result = JSON.parse(jsonMatch[1] || jsonMatch[0]); // jsonMatch[1] for ```json```, jsonMatch[0] for plain {..}
        } catch (e2) {
          console.error("Fallback JSON Parse Error:", e2);
          return res.status(500).json({ error: 'Failed to parse AI response after fallback' });
        }
      } else {
        return res.status(500).json({ error: 'Failed to parse AI response' });
      }
    }

    res.json(result);

  } catch (err) {
    console.error('Feedback analysis failed:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
