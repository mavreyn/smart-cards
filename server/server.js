// server.js
import express from 'express';
import fileUpload from 'express-fileupload';
import axios from 'axios';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(fileUpload());
app.use(cors());
app.use(express.json());

// Route to handle POST requests
app.post('/api/send-text', (req, res) => {
    const { text } = req.body;
    console.log('Received text:', text);
    res.json({ message: `Text received: ${text}` });
  });
  
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });