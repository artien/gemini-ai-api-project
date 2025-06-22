const express = require('express');
const dotenv = require('dotenv');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');


// Load environment variables from .env file
dotenv.config();

const app = express();
// Enable JSON body parsing for incoming requests
app.use(express.json());

// Initialize Google Generative AI with API key from environment variables
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// Get the generative model instance
const model = genAI.getGenerativeModel({ model: 'models/gemini-1.5-flash' });

// Configure Multer for file uploads. Files will be stored in the 'uploads/' directory.
const upload = multer({ dest: 'uploads/' });

/**
 * Helper function to convert a file to a Generative Part object for the Gemini API.
 * Reads the file, encodes it to base64, and includes its MIME type.
 * @param {string} filePath - The path to the file.
 * @param {string} mimeType - The MIME type of the file.
 * @returns {object} A Generative Part object suitable for the Gemini API.
 */
const fileToGenerativePart = (filePath, mimeType) => {
  const buffer = fs.readFileSync(filePath);
  return {
    inlineData: {
      data: buffer.toString('base64'),
      mimeType: mimeType
    }
  };
};

/**
 * Handles common logic for generating content with the Gemini model and sending responses.
 * Includes error handling and temporary file cleanup.
 * @param {Array<string|object>} parts - The content parts (text, image, audio, etc.) to send to the Gemini model.
 * @param {object} res - The Express response object.
 * @param {string} [filePathToCleanUp=null] - Optional path to a temporary file to delete after processing.
 */
const handleGenerateContent = async (parts, res, filePathToCleanUp = null) => {
  try {
    const result = await model.generateContent(parts);
    const response = result.response;
    res.json({ output: response.text() });
  } catch (error) {
    // Log the full error for debugging purposes on the server
    console.error('Error generating content:', error);
    // Send a more generic error message to the client for security
    res.status(500).json({ error: 'Failed to generate content', details: error.message });
  } finally {
    // Clean up the temporary uploaded file if a path is provided
    if (filePathToCleanUp) {
      try {
        fs.unlinkSync(filePathToCleanUp); // Synchronous deletion for simplicity. Consider fs.promises.unlink for async.
      } catch (cleanupError) {
        console.error('Error deleting temporary file:', cleanupError);
      }
    }
  }
};

// Endpoint 1: Generate Text
// Expects a JSON body with a 'prompt' field.
app.post('/generate-text', async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required for text generation.' });
  }

  await handleGenerateContent([prompt], res);
});


// Endpoint 2: Generate from Image
// Expects an image file upload with field name 'image' and an optional 'prompt'.
app.post('/generate-from-image', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image file uploaded.' });
  }
  const prompt = req.body.prompt || 'Describe the image';
  const imagePart = fileToGenerativePart(req.file.path, req.file.mimetype);
  
  await handleGenerateContent([prompt, imagePart], res, req.file.path);
});


// Endpoint 3: Generate from Document
// Expects a document file upload with field name 'document' and an optional 'prompt'.
app.post('/generate-from-document', upload.single('document'), async (req, res) => {
  const prompt = req.body.prompt || 'Analyze this document';
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const filePath = req.file.path;
  const mimeType = req.file.mimetype;

  const documentPart = fileToGenerativePart(filePath, mimeType);
  await handleGenerateContent([prompt, documentPart], res, filePath);
});

// Endpoint 4: Generate from Audio
// Expects an audio file upload with field name 'audio'.
app.post('/generate-from-audio', upload.single('audio'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No audio file uploaded.' });
  }
  const audioPart = fileToGenerativePart(req.file.path, req.file.mimetype);
  const parts = ['Transcribe or analyze the following audio:', audioPart];
  
  await handleGenerateContent(parts, res, req.file.path);
});


// Use PORT from environment variables or default to 3000
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`GEMINI API server is running at http://localhost:${PORT}`);
});
