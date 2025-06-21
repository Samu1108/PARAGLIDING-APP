const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3002;

// Serve static files (HTML, CSS, JS)
app.use(express.static(__dirname));

// Middleware to parse multipart form data
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Directory where flight data will be saved
const BASE_DIR = path.join(__dirname, 'flights_data');

// Upload handler
app.post('/upload', upload.fields([
  { name: 'igcFile', maxCount: 1 }
]), (req, res) => {
  const {
    pilotName,
    flightDate,
    description,
    score
  } = req.body;

  if (!flightDate) {
    return res.status(400).send('Missing flight date');
  }

  const flightDir = path.join(BASE_DIR, flightDate);
  if (!fs.existsSync(flightDir)) {
    fs.mkdirSync(flightDir, { recursive: true });
  }

  const jsonData = {
    pilotName,
    flightDate,
    description,
    score: JSON.parse(score)
  };

  // Save the flight data JSON
  fs.writeFileSync(
    path.join(flightDir, 'data.json'),
    JSON.stringify(jsonData, null, 2)
  );

  // Save the IGC file if present
  if (req.files.igcFile && req.files.igcFile.length > 0) {
    fs.writeFileSync(
      path.join(flightDir, 'track.igc'),
      req.files.igcFile[0].buffer
    );
  }

  res.status(200).send('Flight saved');
});

// API: get list of flight dates
app.get('/api/voli', (req, res) => {
  if (!fs.existsSync(BASE_DIR)) return res.json([]);
  const dirs = fs.readdirSync(BASE_DIR).filter(file =>
    fs.statSync(path.join(BASE_DIR, file)).isDirectory()
  );
  res.json(dirs);
});

// API: get specific flight data, including info if IGC track is present
app.get('/api/volo/:date', (req, res) => {
  const flightDir = path.join(BASE_DIR, req.params.date);
  const dataPath = path.join(flightDir, 'data.json');
  if (!fs.existsSync(dataPath)) return res.status(404).send('Not found');

  const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

  // Check if IGC file exists
  const igcPath = path.join(flightDir, 'track.igc');
  data.hasIgc = fs.existsSync(igcPath);

  res.json(data);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
