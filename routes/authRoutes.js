const express = require("express");
const { register, login } = require("../controllers/authController");
const authMiddleware = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/register", register);
router.post("/login", login);

router.get("/current-user", authMiddleware, (req, res) => {
  res.json(req.user); 
});

module.exports = router;
