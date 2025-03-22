const express = require('express');
const { scanBarcode, statisticMahasiswa } = require('./handler');

const router = express.Router();

router.post('/scan', scanBarcode);
router.get('/statistic', statisticMahasiswa);

module.exports = router;
