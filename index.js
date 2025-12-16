require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Allow requests from any origin (you can restrict this later)
app.use(cors());
app.use(express.json());

// Chat endpoint
app.post('/chat', async (req, res) => {
  const userMessage = req.body.message;
  if (!userMessage) {
    return res.status(400).json({ error: 'No message provided' });
  }

  try {
    const response = await fetch(
      'https://api-inference.huggingface.co/routers/text-generation/default',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.HF_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: "distilgpt2",
          inputs: userMessage,
          parameters: { max_new_tokens: 100 }
        }),
      }
    );

    const data = await response.json();

    if (response.ok && Array.isArray(data) && data[0]?.generated_text) {
      return res.json({ reply: data[0].generated_text });
    } else {
      console.error('HuggingFace Router API error:', data);
      return res.json({ reply: "AI service temporarily unavailable. Try again later." });
    }

  } catch (err) {
    console.error('Server error:', err);
    res.json({ reply: "Server error. Please try again later." });
  }
});

// Listen on all network interfaces
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Mental Wellness backend running at http://0.0.0.0:${PORT}`);
});
