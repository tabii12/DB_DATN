import mongoose from "mongoose";

const brandSchema = new mongoose.Schema(
  {
    MaTH: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    TenTH: {
      type: String,
      required: true,
      trim: true,
    },
    Logo: {
      type: String,
      trim: true,
      default: "",
    },
  },
);

const Brand =
  mongoose.models.Brand || mongoose.model("Brand", brandSchema, "brands");

export default Brand;
