var express = require('express');
var router = express.Router();
const upload = multer({ dest: 'uploads/' });

const {
  getAllBrands,
  getBrandById,
  createBrand,
} = require('../controllers/brandController');

router.get('/', getAllBrands);

router.get('/:id', getBrandById);

router.post('/create', upload.single('Logo'), createBrand);

module.exports = router;
