# AI Whisper Transcription App

This is a simple Node.js web application that allows users to upload an audio file and transcribe it using OpenAI's Whisper API.

The app processes the audio, returns the transcription to the user, and also provides the option to download the transcription as a plain text file.

The filename of the text file is dynamically generated based on the first three words of the transcription and a timestamp.

<mark>**Important**:</mark>
- using this app requires setting up billing with open AI and paying for credits.

## Features
- **Audio Upload**:  
Users can upload audio files via a web form.
- **OpenAI Whisper Integration**:  
The app sends the uploaded audio to OpenAI's Whisper API for transcription.
- **Transcription Display**:  
Once transcribed, the text is displayed on the web page.
- **Downloadable Transcription**:  
Users can download the transcription as a `.txt` file, with a filename that includes the first three words of the transcription and a timestamp.
- **Supports Various Audio Formats**:  
The app supports common audio file formats, such as `m4a`, `mp3`, `wav`, `ogg`, etc.

#### Contents
1. [Installation](#installation "Installation")
1. [Usage](#usage "Usage")
1. [Environment variables](#environment-variables "Environment Variables")
1. [Dynamically creating filename from transcription + timestamp](#file-upload-handling "Dynamically creating filename from transcription + timestamp")
1. [Downloadable transcription as plain text file](#dynamic-transcription-filename "Downloadable transcription as plain text file")
1. [Downloadable transcription](#downloadable-transcription "Downloadable Transcription")
1. [Error handling](#error-handling "Error Handling")
1. [Supported audio formats](#supported-audio-formats "Supported Audio Formats")
1. [Known issues](#known-issues "Known Issues")
1. [Contributing](#contributing "Contributing")
1. [License](#license "License")
1. [Appendices](#appendices "Appendices")
   1. Notes
   1. Acknowledgments

---

## Installation

Follow these steps to install and run the app on your local machine:

### Prerequisites

- Node.js (version 16 or higher)
- An OpenAI API key (You can generate this by signing up for OpenAI [here](https://platform.openai.com/signup))

### Step-by-step setup

1. **Clone the repository**:
```bash
git clone https://github.com/your-username/ai-whisper.git
cd ai-whisper
```

2. **Install dependencies**:
   Run the following command to install the required packages:
```bash
npm install
```

3. **Set up environment variables**:
   Create a `.env` file in the root of your project and add your OpenAI API key:
```bash
touch .env
```

   Add the following content to the `.env` file:
```env
OPENAI_API_KEY=your-openai-api-key-here
```

4. **Run the application**:
   Start the Express server:
```bash
node server.js
```

5. **Access the application**:
   Open your browser and go to `http://localhost:${PORT}` to see the audio upload form.

## Usage
1. Open your browser and navigate to `http://localhost:${PORT}`.
2. Upload an audio file in any of the supported formats (see [Supported Audio Formats](#supported-audio-formats "Supported Audio Formats") below).
3. Click "Upload and Transcribe".
4. Once the transcription is complete, the result will be displayed on the screen.
5. A download link will appear allowing you to download the transcription as a `.txt` file.

## Environment variables
The application uses a `.env` file to store sensitive information like the OpenAI API key. The following environment variable needs to be set:

- `OPENAI_API_KEY`: Your API key from OpenAI, which is required to use Whisper.

## File upload handling
We use **Multer** to handle file uploads. Files are temporarily stored in the `uploads/` directory. The app processes the uploaded file by sending it to the Whisper API for transcription.

Here’s a quick breakdown of the process:
- Users upload a file through the web form.
- Multer stores the file in the `uploads/` directory.
- The server reads the file and sends it to OpenAI’s Whisper API for transcription.

### Supported audio formats

The Whisper API supports the following audio file formats:
- `.flac`
- `.m4a`
- `.mp3`
- `.mp4`
- `.mpeg`
- `.mpga`
- `.oga`
- `.ogg`
- `.wav`
- `.webm`

## Dynamically creating filename from transcription + timestamp
Once the transcription is successfully generated, a `.txt` file containing the transcription is saved in the `uploads/` directory. The filename is dynamically generated based on:
- The **first three words**¹ of the transcription (spaces are replaced by underscores `_`).
- A **timestamp** in the format `YYYY-MM-DD--minutes-seconds`.

For example, a transcription that starts with "Four score and seven" and was transcribed at `2024-10-15 14:25:05` will be saved as:
```bash
Four_score_and_2024-10-15--25-05.txt
```

## Downloadable transcription as plain text file
Once the transcription is generated, the app provides a download link so users can download the transcription in plain text format. The text file contains only the transcription text and no additional content (e.g., no labels like "Transcription Result").

### Example:
The link will look like:
```html
<a href="/download-transcription/Four_score_and_2024-10-15--25-05.txt">
	Download Transcription
</a>
```

## Error Handling
The application includes basic error handling to manage potential issues:
- **File format validation**: If a file with an unsupported format is uploaded, the app returns an error message.
- **API request errors**: If there is an issue with the request to OpenAI's API (e.g., an invalid API key or network issue), the app logs the error and informs the user.
- **General errors**: Other errors, such as file system issues, are logged and the user is informed that transcription failed.

### Example Error:
If an error occurs during transcription, the user will see a message like:
```html
<h1>Transcription Failed</h1>
<p>{"error": "An error occurred during transcription"}</p>
```

## Known Issues
- `__dirname Not Defined`: Since this project uses ES modules, we manually define `__dirname` using `fileURLToPath` and `dirname` from the `url` module.
- **Large File Handling**: Currently, the app stores uploaded files temporarily in memory. For larger audio files, you might want to extend file handling capabilities (e.g., adding file size validation or streaming).

## Contributing
Come on down! Just follow these steps:

1. Fork the repository.
2. Create a new feature branch (`git checkout -b feature-name`).
3. Commit your changes (`git commit -am 'Add feature'`).
4. Push the branch (`git push origin feature-name`).
5. Create a Pull Request.

Please follow the project's coding conventions. Also include appropriate tests.

## License
MIT.

## Appendices

#### Notes

1. To test all this, I used the Gettysburg address by Abraham Lincoln. If you see things like four score and seven years ago, that's where that's coming from.

#### Acknowledgements

Whisper AI by OpenAI

At various points I tested the transcription quality with poems by [Osip Mandelstam](https://www.poetryfoundation.org/poets/osip-mandelstam).

---

Thank you! • SL