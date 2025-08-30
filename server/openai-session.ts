import express from 'express';
import fetch from 'node-fetch';
import 'dotenv/config';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is not set; refusing to start OpenAI session server');
}

export const openaiSessionRouter = express.Router();

openaiSessionRouter.post('/session', async (req, res) => {
  try {
    const response = await fetch('https://api.openai.com/v1/realtime/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
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

openaiSessionRouter.post('/sdp-exchange', async (req, res) => {
  try {
    const { offerSdp } = req.body as { offerSdp: string };
    const response = await fetch('https://api.openai.com/v1/realtime/answer', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/sdp',
      },
      body: offerSdp,
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI SDP error:', error);
      return res.status(response.status).send(error);
    }

    const answerSdp = await response.text();
    res.json({ answerSdp });
  } catch (error) {
    console.error('Error in SDP exchange:', error);
    res.status(500).send('SDP exchange failed');
  }
});
