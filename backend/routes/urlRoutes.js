const express = require("express");
const crypto = require("crypto");
const mongoose = require("mongoose");
const Url = require("../models/Url");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Create a new short link
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { originalUrl, customAlias } = req.body;

    if (!originalUrl || typeof originalUrl !== "string") {
      return res.status(400).json({
        message: "Original URL is required.",
      });
    }

    const cleanedUrl = originalUrl.trim();

    let parsedUrl;

    try {
      parsedUrl = new URL(cleanedUrl);
    } catch {
      return res.status(400).json({
        message: "Please enter a valid URL.",
      });
    }

    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      return res.status(400).json({
        message: "Only HTTP and HTTPS URLs are supported.",
      });
    }

    let shortCode = typeof customAlias === "string" ? customAlias.trim() : "";

    // Validate custom alias
    if (shortCode && !/^[a-zA-Z0-9_-]{3,30}$/.test(shortCode)) {
      return res.status(400).json({
        message: "Alias must be 3-30 letters, numbers, _ or -.",
      });
    }

    // Generate a unique code if no custom alias is provided
    if (shortCode) {
      const existing = await Url.findOne({ shortCode });

      if (existing) {
        return res.status(409).json({
          message: "This custom alias is already taken.",
        });
      }
    } else {
      let existing;

      do {
        shortCode = crypto.randomBytes(4).toString("hex");
        existing = await Url.findOne({ shortCode });
      } while (existing);
    }

    // Save the URL document in MongoDB
    const savedUrl = await Url.create({
      originalUrl: cleanedUrl,
      shortCode,
      clicks: 0,
      userId: req.user.userId,
    });

    // Build the short URL separately
    const shortUrl = `${req.protocol}://${req.get("host")}/${savedUrl.shortCode}`;

    return res.status(201).json({
      message: "Short link created successfully.",
      id: savedUrl._id,
      originalUrl: savedUrl.originalUrl,
      shortCode: savedUrl.shortCode,
      shortUrl,
      clicks: savedUrl.clicks,
      createdAt: savedUrl.createdAt,
    });
  } catch (error) {
    console.error("Create URL error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        message: "This short code already exists. Try another alias.",
      });
    }

    return res.status(500).json({
      message: "Unable to create the short link.",
      error: error.message,
    });
  }
});

// Get all short links
router.get("/", authMiddleware, async (req, res) => {
  try {
    const urls = await Url.find({ userId: req.user.userId }).sort({
      createdAt: -1,
    });

    return res.json(
      urls.map((url) => ({
        id: url._id,
        originalUrl: url.originalUrl,
        shortCode: url.shortCode,
        shortUrl: `${req.protocol}://${req.get("host")}/${url.shortCode}`,
        clicks: url.clicks,
        createdAt: url.createdAt,
      })),
    );
  } catch (error) {
    console.error("Fetch URLs error:", error);

    return res.status(500).json({
      message: "Unable to fetch links.",
    });
  }
});

// Get analytics for all links
router.get("/analytics/summary", authMiddleware, async (req, res) => {
  try {
    const urls = await Url.find({
      userId: new mongoose.Types.ObjectId(req.user.userId),
    });

    const totalLinks = urls.length;

    const totalClicks = urls.reduce((sum, url) => sum + (url.clicks || 0), 0);

    const topLinks = [...urls]
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 5)
      .map((url) => ({
        id: url._id,
        originalUrl: url.originalUrl,
        shortCode: url.shortCode,
        clicks: url.clicks,
        createdAt: url.createdAt,
      }));

    // Build daily click counts for the last 90 days.
    // Build daily click counts for the last 90 days.
    const dailyClicks = {};

    for (let i = 89; i >= 0; i--) {
      const date = new Date();
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() - i);

      const key = [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, "0"),
        String(date.getDate()).padStart(2, "0"),
      ].join("-");

      dailyClicks[key] = 0;
    }

    urls.forEach((url) => {
      (url.clickHistory || []).forEach((click) => {
        const clickedAt = new Date(click.clickedAt);

        if (Number.isNaN(clickedAt.getTime())) return;

        const key = [
          clickedAt.getFullYear(),
          String(clickedAt.getMonth() + 1).padStart(2, "0"),
          String(clickedAt.getDate()).padStart(2, "0"),
        ].join("-");

        if (Object.prototype.hasOwnProperty.call(dailyClicks, key)) {
          dailyClicks[key] += 1;
        }
      });
    });

    const clicksOverTime = Object.entries(dailyClicks).map(
      ([date, clicks]) => ({
        date,
        clicks,
      }),
    );

    return res.status(200).json({
      totalLinks,
      totalClicks,
      topLinks,
      clicksOverTime,
    });
  } catch (error) {
    console.error("Analytics error:", error);

    return res.status(500).json({
      message: "Unable to fetch analytics.",
    });
  }
});

// Delete only a link owned by the logged-in user
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid link ID.",
      });
    }

    const deletedUrl = await Url.findOneAndDelete({
      _id: id,
      userId: req.user.userId,
    });

    if (!deletedUrl) {
      return res.status(404).json({
        message: "Link not found.",
      });
    }

    return res.json({
      message: "Link deleted successfully.",
      id: deletedUrl._id,
    });
  } catch (error) {
    console.error("Delete URL error:", error);

    return res.status(500).json({
      message: "Unable to delete the link.",
    });
  }
});

module.exports = router;
