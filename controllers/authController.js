const User = require("../models/User");
const { attachCookiesToResponse, createTokenUser } = require("../utils");
const bcrypt = require("bcryptjs");


const register = async (req, res) => {
  const { name, email, password } = req.body;
  // Set first account to an admin one
  const isFirstAccount = (await User.countDocuments({})) === 0;
  const role = isFirstAccount ? "admin" : "user";
  const user = await User.create({ name, email, password, role });

  const tokenUser = createTokenUser(user);

  attachCookiesToResponse(res, tokenUser);
  res.status(201).json({ user: tokenUser });

};

const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(401).json({ msg: "Please provide email and password" });
  }

  if (email) {
    const user = await User.findOne({ email });
    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!user || !isPasswordCorrect) {
      res.status(401).json({ msg: "Wrong email or password" });
    }

    const tokenUser = createTokenUser(user);

    attachCookiesToResponse(res, tokenUser);
    res.status(200).json({ user: tokenUser });
  }
};

const logout = async (req, res) => {
  res.cookie("jwtCookie", "logout", {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  res.status(200).json({ msg: "user logged out" });
};

module.exports = { login, logout, register };
