import express from 'express';
import { main } from './gpt'; // Importe a função main do arquivo gpt.ts

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.post('/chat', async (req, res) => {
  const { input } = req.body;
  if (!input) {
    return res.status(400).send({ error: 'Input is required' });
  }

  try {
    const response = await main(input);
    res.send(response);
  } catch (error) {
    res.status(500).send({ error: 'Failed to process request' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});