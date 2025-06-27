import express from 'express';
import { MongoClient } from 'mongodb';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = 3000;

// ⛔ WARNING: Don't use hardcoded credentials in production
const MONGODB_URI = 'mongodb+srv://binod:binod123@cluster0.heugg6b.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const client = new MongoClient(MONGODB_URI);

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// POST route to save username
app.post('/api/submit', async (req, res) => {
  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ error: 'Username is required' });
  }

  try {
    await client.connect();
    const db = client.db('discord_verify');
    const collection = db.collection('usernames');

    await collection.insertOne({
      username,
      submittedAt: new Date()
    });

    res.status(200).json({ message: 'Saved to MongoDB!' });
  } catch (err) {
    console.error('MongoDB error:', err);
    res.status(500).json({ error: 'Something went wrong' });
  } finally {
    await client.close(); // optional: you could keep it open for performance
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
