import express from 'express';
import { MongoClient } from 'mongodb';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = 3000;

// Use environment variable for MongoDB URI
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('Error: MONGODB_URI environment variable is not set.');
  process.exit(1);
}

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
