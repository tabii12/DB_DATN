const mongoose = require("mongoose");

const ContactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    tour_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tour",
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "contacted", "resolved", "cancelled"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  },
);

const Contact =
  mongoose.models.Contact ||
  mongoose.model("Contact", ContactSchema, "contacts");

module.exports = Contact;
