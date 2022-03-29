const bcryptjs = require("bcryptjs");
const User = require("../models/User");
const {
  createTokenUser,
  attachCookiesToResponse,
  checkPermissions,
} = require("../utils");

const getAllUser = async (req, res) => {
  const users = await User.find({ role: "user" }).select("-password");
  if (!users) {
    throw new Error("No users");
  }
  res.status(200).json({ users });
};

const getSingleUser = async (req, res) => {
  const { id } = req.params;
  const user = await User.findOne({ _id: id }).select("-password");
  checkPermissions(req.user, user._id)
  res.status(201).json({ user });
};

const showCurrentUser = async (req, res) => {
  res.status(200).json(req.user);
};

const updateUser = async (req, res) => {
  const { name, email } = req.body;
  const { userId } = req.user;

  if (!name || !email) {
    throw new Error("Please fill info");
  }

  const user = await User.findOneAndUpdate(
    { _id: userId },
    { email, name },
    { new: true, runValidators: true }
  );
  const tokenUser = createTokenUser(user);
  attachCookiesToResponse(res, tokenUser);
  res.status(200).json({ tokenUser });
};

const updateUserPassword = async (req, res) => {
  const { userId } = req.user;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    res.status(400).json({ msg: "Please provide current and new password" });
  }

  const user = await User.findOne({ _id: userId });
  console.log(user);
  const { password } = user;

  const isPasswordCorrect = await bcryptjs.compare(currentPassword, password);

  if (!isPasswordCorrect) {
    throw new Error("Password don't match");
  }

  user.password = newPassword;
  await user.save();

  res.status(200).json({ msg: "password updated" });
};

module.exports = {
  getAllUser,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
};
