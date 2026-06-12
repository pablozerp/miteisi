const express = require('express');
const router = express.Router();
const { upload, handleUpload } = require('../controllers/uploadController');
const { verifyToken } = require('../middleware/authMiddleware');

// Solo usuarios autenticados pueden subir imágenes
router.post('/', verifyToken, upload.single('image'), handleUpload);

module.exports = router;
