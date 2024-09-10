const Joi = require("joi");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");

const registerSchema = Joi.object({
  username: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

exports.register = async (req, res) => {
  try {
    const { username, email, password } = await registerSchema.validateAsync(
      req.body
    );
    const user = new User({ username, email, password });
    await user.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = await loginSchema.validateAsync(req.body);
    const user = await User.findOne({ email });
    if (!user || !user.comparePassword(password)) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    const userData = {
      _id: user._id,
      name: user.username,
      email: user.email,
    };

    res.json({ token, user: userData });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
