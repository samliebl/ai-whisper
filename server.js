import dotenv from 'dotenv';
dotenv.config();  // Loads the .env file to access your OpenAI API key securely

import express from 'express';
import multer from 'multer';  // Multer will handle the file uploads
import fs from 'fs';  // We'll use fs to interact with the file system (saving files, etc.)
import fetch from 'node-fetch';  // Fetch is for making API requests
import FormData from 'form-data';  // FormData is used to build the multipart form data for the Whisper API
import path from 'path';
import { fileURLToPath } from 'url';  // These two imports help us define __dirname for ESM
import { dirname } from 'path';

// Define __dirname since it's not available in ES modules by default
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Express (basic web framework for creating a server)
const app = express();
const port = 3000;  // Define the port the server will run on

// Multer configuration: Files uploaded will be stored in the 'uploads/' folder
const upload = multer({ dest: 'uploads/' });

// Helper function to generate a dynamic file name for the transcription
function generateFileName(transcription) {
    // Extract the first three words from the transcription text to use in the filename
    const firstThreeWords = transcription.split(' ').slice(0, 3).join('_');

    // Get the current timestamp in the format YYYY-MM-DD--minutes-seconds
    const now = new Date();
    const timestamp = `${now.getFullYear()}-${(now.getMonth() + 1)
        .toString()
        .padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}--${now
        .getMinutes()
        .toString()
        .padStart(2, '0')}-${now.getSeconds().toString().padStart(2, '0')}`;

    // The final filename will look like "first_three_words_YYYY-MM-DD--minutes-seconds.txt"
    return `${firstThreeWords}_${timestamp}.txt`;
}

// Route to serve a simple HTML form for uploading audio files
app.get('/', (req, res) => {
    res.send(`
        <h1>Whisper Transcription</h1>
        <form action="/transcribe" method="POST" enctype="multipart/form-data">
            <input type="file" name="audio" accept="audio/*" required />
            <button type="submit">Upload and Transcribe</button>
        </form>
    `);  // This HTML form lets users upload an audio file. When submitted, it sends a POST request to /transcribe.
});

// Route to handle file uploads and send them to OpenAI's Whisper API for transcription
app.post('/transcribe', upload.single('audio'), async (req, res) => {
    try {
        const audioFilePath = req.file.path;  // Multer saves the uploaded file in 'uploads/' and we grab its path

        // Log some basic details about the uploaded file
        console.log(`Uploaded file: ${req.file.originalname}, MIME type: ${req.file.mimetype}`);

        // Create a FormData object to send the file and required data to OpenAI's Whisper API
        const form = new FormData();
        form.append('file', fs.createReadStream(audioFilePath), {
            filename: req.file.originalname,  // Send the original filename
            contentType: req.file.mimetype,   // Explicitly set the MIME type for the file
        });
        form.append('model', 'whisper-1');  // This specifies the Whisper model to use for transcription

        // Log that we’re sending the file to the OpenAI API for transcription
        console.log('Sending file to OpenAI Whisper API for transcription...');

        // Send the request to OpenAI's Whisper API using fetch
        const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,  // Send the API key from our .env file
                ...form.getHeaders(),  // Include the necessary headers for the multipart form data
            },
            body: form,  // The FormData containing the audio file
        });

        // Log that we received a response from OpenAI
        console.log('Received response from OpenAI...');

        // Parse the response data
        const data = await response.json();

        // Check if the transcription was successful (i.e., we have the 'text' field)
        if (data.text) {
            // Generate a dynamic file name for the transcription based on the content and timestamp
            const fileName = generateFileName(data.text);

            // Save the transcription to a text file in the 'uploads/' directory
            const transcriptPath = path.join(__dirname, 'uploads', fileName);
            fs.writeFileSync(transcriptPath, data.text);

            // Send the transcription back to the user along with a download link for the plain text file
            res.send(`
                <h1>Transcription Result:</h1>
                <p>${data.text}</p>
                <a href="/download-transcription/${fileName}">Download Transcription</a>
            `);
        } else {
            // If something went wrong, log the error and show a failure message
            console.error('Transcription failed:', data);
            res.send(`<h1>Transcription Failed</h1><p>${JSON.stringify(data)}</p>`);
        }
    } catch (error) {
        // Log any unexpected errors and return a 500 error to the user
        console.error('Error during transcription process:', error);
        res.status(500).json({ error: 'An error occurred during transcription' });
    }
});

// Route to handle downloading the generated transcription text file
app.get('/download-transcription/:fileName', (req, res) => {
    // The transcription file is located in the 'uploads/' directory with the given file name
    const transcriptPath = path.join(__dirname, 'uploads', req.params.fileName);
    res.download(transcriptPath, req.params.fileName, (err) => {
        if (err) {
            console.error('Error during file download:', err);  // Log any errors during the download process
        }
    });
});

// Start the Express server on port 3000
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);  // Log a message when the server starts successfully
});
