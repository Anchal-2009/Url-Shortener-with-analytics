const mongoose = require("mongoose");

const urlSchema = new mongoose.Schema(
  {
    userId: {
      type: require("mongoose").Schema.Types.ObjectId,
      ref: "User",
      required: false,
      index: true,
    },
    originalUrl: {
      type: String,
      required: true,
      trim: true,
    },

    shortCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    clicks: {
      type: Number,
      default: 0,
    },
    clickHistory: [
      {
        clickedAt: {
          type: Date,
          default: Date.now,
        },
        referrer: {
          type: String,
          default: "",
        },
      },
    ],
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Url", urlSchema);
