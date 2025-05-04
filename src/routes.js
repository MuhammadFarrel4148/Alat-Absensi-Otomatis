const express = require('express');
const { scanBarcode, statisticMahasiswa, loginAccount, logoutAccount, accessValidation } = require('./handler');

const router = express.Router();

router.post('/scan', scanBarcode);
router.get('/statistic', accessValidation ,statisticMahasiswa);
router.post('/login', loginAccount);
router.post('/logout', logoutAccount);

module.exports = router;
