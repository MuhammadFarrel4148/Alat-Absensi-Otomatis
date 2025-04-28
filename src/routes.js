const express = require('express');
const { scanBarcode, statisticMahasiswa, loginAccount, logoutAccount } = require('./handler');

const router = express.Router();

router.post('/scan', scanBarcode);
router.get('/statistic', statisticMahasiswa);
router.post('/login', loginAccount);
router.post('/logout', logoutAccount);

module.exports = router;
