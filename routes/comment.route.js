const express = require("express");
const router = express.Router();

const commentController = require("../controllers/comment.controller");

router.post("/create", commentController.createComment);
router.get("/tour/:tourId", commentController.getCommentsByTour);
router.put("/:commentId", commentController.updateComment);
router.delete("/:commentId", commentController.deleteComment);

module.exports = router;
