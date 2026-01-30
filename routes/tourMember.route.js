const express = require('express');
const router = express.Router();
const TourMemberController = require('../controllers/tourMember.controller');

router.post('/create', TourMemberController.createTourMember);
router.get('/', TourMemberController.getAllTourMembers);
router.get('/tour/:tour_id', TourMemberController.getAllTourMembersByTripId);
router.put('/:id', TourMemberController.updateTourMemberById);
router.delete('/:id', TourMemberController.deleteTourMemberById);

module.exports = router;