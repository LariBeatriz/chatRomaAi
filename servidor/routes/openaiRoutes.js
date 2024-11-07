// routes/openaiRoutes.js
const express = require('express');
const router = express.Router();
const { openaiChat } = require('../controllers/openaiController');

router.post('/chat', openaiChat);

module.exports = router;
