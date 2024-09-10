require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const authRoutes = require("./routes/authRoutes");
const postRoutes = require("./routes/postRoutes");
const { errorHandler } = require("./middlewares/errorHandler");

const app = express();

const cors = require("cors");
const authMiddleware = require("./middlewares/authMiddleware");

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);

app.use(errorHandler);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");

    const PORT = process.env.PORT || 5000;
    // app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.log(err));

module.exports = app;
