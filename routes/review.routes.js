const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/review.controller');

router.post('/create', reviewController.createReview);
router.get('/tour/:tour_id', reviewController.getReviewsByTour);
router.put('/:id', reviewController.updateReviewById);
router.delete('/:id', reviewController.deleteReviewById);

module.exports = router;