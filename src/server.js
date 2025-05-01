require('dotenv').config();
const express = require('express');
const router = require('./routes');
const cors = require('cors');
const http = require('http');
const axios = require('axios');
const { Server } = require('socket.io');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline'); 

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());
app.use('', router);

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

io.on('connection', (socket) => {
    console.log('Website terhubung');
    socket.on('disconnect', () => {
        console.log('Website terputus')
    });
});

const serialPort = new SerialPort({
    path: "COM3",
    baudRate: 9600,
});

const parser = serialPort.pipe(new ReadlineParser({ delimiter: "\r\n"}));

parser.on('data', async(barcode) => {
    const cleanBarcode = barcode.trim();

    console.log(`Barcode Scanned: ${cleanBarcode}`);

    try {
        const response = await axios.post('http://localhost:3000/scan', {
            barcode: cleanBarcode
        });

        io.emit('barcode-scanned', cleanBarcode, response.data.status, response.data.message);

    } catch(error) {
        io.emit('barcode-scanned', cleanBarcode, error.response.data.status, error.response.data.message);
    }
});

server.listen(process.env.PORT, () => {
    console.log(`Server berjalan di ${process.env.PORT}`);
});
