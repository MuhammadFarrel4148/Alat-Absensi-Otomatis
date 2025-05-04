const express = require('express');
const { scanBarcode, statisticMahasiswa, loginAccount, logoutAccount, accessValidation, getProfile } = require('./handler');

const router = express.Router();

router.post('/scan', scanBarcode);
router.post('/login', loginAccount);
router.post('/logout', logoutAccount);
router.get('/statistic', accessValidation ,statisticMahasiswa);
router.get('/profile', getProfile);

module.exports = router;
