require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const Url = require("./models/Url");
const urlRoutes = require("./routes/urlRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();

app.use(express.json());
app.use(cors());

// Mongo connection
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("Connection successfull"))
  .catch((err) => console.log(err));

//routes
app.use("/api/urls", urlRoutes);
app.use("/api/auth", authRoutes);

//redirect to original url
app.get("/:code", async (req, res) => {
  try {
    const url = await Url.findOne({
      shortCode: req.params.code,
    });

    if (!url) {
      return res.status(404).send("Short link not found.");
    }

    url.clicks += 1;

    url.clickHistory.push({
      clickedAt: new Date(),
      referrer: req.get("referer") || "",
    });

    await url.save();

    return res.redirect(302, url.originalUrl);
  } catch (error) {
    console.error("Redirect error:", error);
    return res.status(500).send("Unable to redirect.");
  }
});

// server
const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`server is listening to port ${port}`);
});
