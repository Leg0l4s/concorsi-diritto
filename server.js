const fetch = require('node-fetch');
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors({
  origin: ['http://localhost:3000', 'https://concorsodiritto.netlify.app'],
  credentials: true
}));
app.use(express.json());

app.post('/api/ai', async (req, res) => {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + req.body.apiKey
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{role: 'user', content: req.body.prompt}]
    })
  });
  const data = await response.json();
  res.json({content: [{text: data.choices[0].message.content}]});
});
app.listen(3001, () => console.log('Server su 3001'));