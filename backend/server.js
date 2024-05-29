// server.js

const express = require('express');
const WebSocket = require('ws');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 5001;

const wss = new WebSocket.Server({ port: 8001 });

// Map to store historical prices data
let historicalPrices = {
    bitcoin: {},
    ethereum: {}
};

// Function to fetch historical prices data from the API
const fetchHistoricalPrices = async () => {
    try {
        const bitcoinResponse = await axios.get('https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=30');
        const ethereumResponse = await axios.get('https://api.coingecko.com/api/v3/coins/ethereum/market_chart?vs_currency=usd&days=30');

        // Store Bitcoin historical prices
        bitcoinResponse.data.prices.forEach(price => {
            historicalPrices.bitcoin[price[0]] = price[1];
        });

        // Store Ethereum historical prices
        ethereumResponse.data.prices.forEach(price => {
            historicalPrices.ethereum[price[0]] = price[1];
        });

        console.log('Historical prices data fetched successfully:', historicalPrices);
    } catch (error) {
        console.error('Error fetching historical prices data:', error);
    }
};

// Fetch historical prices data once on server startup
fetchHistoricalPrices();

// Start the interval for periodic fetches after the initial fetch
setTimeout(() => {
    // Fetch historical prices data periodically
    setInterval(fetchHistoricalPrices, 3600000); // Fetch every hour (adjust as needed)
}, 10000); // Delay the start of the interval by 10 seconds (adjust as needed)

// WebSocket connection handling
wss.on('connection', ws => {
    console.log('WebSocket connection established server print');

    // Send historical prices data to the client
    ws.send(JSON.stringify({
        type: 'historicalPrices',
        data: historicalPrices
    }));

    // Handle WebSocket messages from the client
    ws.on('message', message => {
        console.log('Received message from client:', message);
        // Add any message handling logic here

        // Prevent the handler function from returning immediately
        return false;
    });

    // Handle WebSocket connection close
    ws.on('close', (code, reason) => {
        console.log('WebSocket connection closed server print');
        console.log('Close code:', code);
        console.log('Reason:', reason);
        // Add any cleanup or additional logic here
    });
});

// Start the server
const server = app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

// Keep the server running indefinitely
server.on('error', error => {
    console.error('Server error:', error);
});