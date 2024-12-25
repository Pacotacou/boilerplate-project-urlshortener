require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

// Basic Configuration

const bodyParser = require('body-parser');
const validUrl = require('valid-url');

const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

const urlDatabase = {};
let urlCounter = 1;

app.post('/api/shorturl', (req, res) => {
  const originalUrl = req.body.url;

  // Validate the URL
  if (!validUrl.isWebUri(originalUrl)) {
      return res.json({ error: 'Invalid URL' });
  }

  // Check if the URL already exists in the database
  let shortUrl = Object.keys(urlDatabase).find(
      key => urlDatabase[key] === originalUrl
  );

  if (!shortUrl) {
      // Add a new URL to the database
      shortUrl = urlCounter++;
      urlDatabase[shortUrl] = originalUrl;
  }

  res.json({
      original_url: originalUrl,
      short_url: shortUrl,
  });
});

app.get(
  '/api/shorturl/:short_url',
  function(req,res){
    const shortUrl = req.params.short_url;

    const originalUrl = urlDatabase[shortUrl];
    if(!originalUrl){
      return res.status(400).json({error: 'No short URL found for the given input'});
    }
    res.redirect(originalUrl);
  }
);
