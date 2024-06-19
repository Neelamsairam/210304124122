import express from "express";
import axios from "axios";

const app = express();
const port = 9876;

// Configuration
const WINDOW_SIZE = 10;
const THIRD_PARTY_API_URL = "http://20.244.56.144"; // Corrected URL
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzE4Nzc4Mjc2LCJpYXQiOjE3MTg3Nzc5NzYsImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6ImYzZDFjZGEyLWM5ZmYtNDQwOS1iN2YyLWIwM2VjYTE5NjM0OCIsInN1YiI6IjIxMDMwMzEyNDQyOEBwYXJ1bHVuaXZlcnNpdHkuYWMuaW4ifSwiY29tcGFueU5hbWUiOiJBZmZvcmRNZWRUZWNoIiwiY2xpZW50SUQiOiJmM2QxY2RhMi1jOWZmLTQ0MDktYjdmMi1iMDNlY2ExOTYzNDgiLCJjbGllbnRTZWNyZXQiOiJGU0ZKaW12TWlEc2J3bGFHIiwib3duZXJOYW1lIjoiSGVtYW50aCIsIm93bmVyRW1haWwiOiIyMTAzMDMxMjQ0MjhAcGFydWx1bml2ZXJzaXR5LmFjLmluIiwicm9sbE5vIjoiMjEwMzAzMTI0NDI4In0.dmYB2NzJAYd48ujExW8mXPjkwiI59VbDtFVD3AXsyqE";

// In-memory storage
let storedNumbers = [];
const lock = new Object();

const fetchNumbers = async (type) => {
  try {
    console.log(`Fetching numbers from ${THIRD_PARTY_API_URL}/${type} with token ${token}`);
    const response = await axios.get(`${THIRD_PARTY_API_URL}/${type}`, {
      timeout: 500,
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (response.status === 200) {
      return response.data.numbers || [];
    }
  } catch (error) {
    console.log(`Error: ${error.response ? error.response.data.message : error.message}`);
    return [];
  }
  return [];
};

app.get('/numbers/:type', async (req, res) => {
  const { type } = req.params;

  if (!['p', 'f', 'e', 'r'].includes(type)) {
    return res.status(400).json({ error: "Invalid type" });
  }

  let windowPrevState, windowCurrState, newNumbers;

  try {
    windowPrevState = [...storedNumbers];
    newNumbers = await fetchNumbers(type);

    // Filter duplicates
    const uniqueNewNumbers = newNumbers.filter(num => !storedNumbers.includes(num));

    // Update stored numbers
    uniqueNewNumbers.forEach(num => {
      if (storedNumbers.length >= WINDOW_SIZE) {
        storedNumbers.shift();
      }
      storedNumbers.push(num);
    });

    windowCurrState = [...storedNumbers];
    const avg = storedNumbers.length ? (storedNumbers.reduce((a, b) => a + b, 0) / storedNumbers.length) : 0;

    const response = {
      windowPrevState,
      windowCurrState,
      numbers: newNumbers,
      avg: avg.toFixed(2)
    };

    console.log(response);
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});