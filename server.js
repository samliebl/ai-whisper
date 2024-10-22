import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import multer from 'multer';
import fs from 'fs';
import fetch from 'node-fetch';
import FormData from 'form-data';

// Initialize Express
const app = express();
const port = 3000;

// Configure Multer to handle file uploads
const upload = multer({ dest: 'uploads/' });

// Serve a simple form at the root URL to upload an audio file
app.get('/', (req, res) => {
    res.send(`
        <h1>Whisper Transcription</h1>
        <form action="/transcribe" method="POST" enctype="multipart/form-data">
            <input type="file" name="audio" accept="audio/*" required />
            <button type="submit">Upload and Transcribe</button>
        </form>
    `);
});

// Endpoint to handle file uploads and transcriptions
app.post('/transcribe', upload.single('audio'), async (req, res) => {
    try {
        const audioFilePath = req.file.path;

        // Check the MIME type of the uploaded file
        console.log(`Uploaded file: ${req.file.originalname}, MIME type: ${req.file.mimetype}`);

        // Create a FormData object to send the file in the correct format
        const form = new FormData();
        form.append('file', fs.createReadStream(audioFilePath), {
            filename: req.file.originalname, // Ensure the filename is sent
            contentType: req.file.mimetype,  // Explicitly set the MIME type
        });
        form.append('model', 'whisper-1');

        // Use fetch to directly call OpenAI's Whisper API with multipart form data
        const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                ...form.getHeaders(),  // Correct headers for form-data
            },
            body: form,
        });

        const data = await response.json();
        console.log('API response:', data);

        if (data.text) {
            res.send(`<h1>Transcription Result:</h1><p>${data.text}</p>`);
        } else {
            res.send(`<h1>Transcription Failed</h1><p>${JSON.stringify(data)}</p>`);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred during transcription' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
