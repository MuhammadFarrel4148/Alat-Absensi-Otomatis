const express = require('express');
const { scanBarcode } = require('./handler');

const router = express.Router();

router.post('/scan', scanBarcode);

module.exports = router;
