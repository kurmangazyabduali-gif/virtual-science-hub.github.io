// Simple static file server for Virtual Science Hub
// Gemini API is called directly from the browser (no backend proxy needed)

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Serve all static files from root
app.use(express.static(__dirname));

// Fallback: any unknown route → index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log('');
    console.log('  ✅  Server started!');
    console.log('');
    console.log('  🌐  Main site:      http://localhost:' + PORT);
    console.log('  🎨  Presentations:  http://localhost:' + PORT + '/presentation.html');
    console.log('');
});
