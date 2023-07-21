const express = require('express');
const axios = require('axios');

const app = express();
const port = 8008;

const fetchWithTimeout = async (url, timeout) => {
  return Promise.race([
    axios.get(url),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Request Timeout')), timeout)
    ),
  ]);
};

app.get('/numbers', async (req, res) => {
  const { url } = req.query;

  if (!url || (typeof url === 'string' && !url.trim())) {
    return res.status(400).json({ error: 'Invalid URL parameter. Please provide valid URLs.' });
  }

  const urls = Array.isArray(url) ? url : [url];
  //console.log(urls);
  try {
     //const timeout = 500; 
    const requests = urls.map(async (u) => {
      try {
        const response = await axios.get(u);
        return response.data.numbers;
      } catch (error) {
        console.error(`Error fetching data from URL ${u}:`, error.message);
        return [];
      }
    });

    const results = await Promise.all(requests);
    const numbers = results.flat();
    const Numbers = [...new Set(numbers)].sort((a, b) => a - b);

    res.json({ numbers: Numbers });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching data from URLs.' });
  }
});

app.listen(port, () => {
  console.log(`Server is running`);
});
