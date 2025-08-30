import express from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

export const openaiSessionRouter = express.Router();

openaiSessionRouter.post('/session', async (req, res) => {
  try {
    const response = await fetch('https://api.openai.com/v1/realtime/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY!}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-realtime-preview',
        modalities: ['audio', 'text'],
        voice: 'verse',
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', error);
      return res.status(response.status).json({ error: 'Failed to create OpenAI session' });
    }

    const sessionData = await response.json();
    res.json(sessionData);
  } catch (error) {
    console.error('Error creating OpenAI session:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
