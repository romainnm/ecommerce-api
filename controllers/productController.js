const Product = require("../models/Product");
const path = require("path");

const createProduct = async (req, res) => {
  req.body.user = req.user.userId;
  //Alternative : const product = await Product.create({ ...req.body, user: req.user.userId });
  const product = await Product.create(req.body);
  res.status(201).json({ product });
};

const getAllProducts = async (req, res) => {
  const products = await Product.find({});
  res.status(200).json({ products });
};

const getSingleProduct = async (req, res) => {
  const { id: productId } = req.params;
  const product = await Product.findOne({ _id: productId }).populate("reviews");

  if (!product) {
    throw new Error("No product found");
  }
  res.status(200).json({ product });
};

const updateProduct = async (req, res) => {
  const { id: productId } = req.params;
  const product = await Product.findOneAndUpdate({ _id: productId }, req.body, {
    new: true,
    runValidators: true,
  });
  /*   if (req.user.role !== admin) {
    throw new Error("Unauthorized");
  } */
  res.status(200).json({ product });
};

const deleteProduct = async (req, res) => {
  /*   if (req.user.role !== admin) {
    throw new Error("Unauthorized");
  } */
  const { id: productId } = req.params;
  const product = await Product.findOne({ _id: productId });

  if (!product) {
    throw new Error("No product found");
  }
  await product.remove();

  res.status(200).json({ msg: "product delete" });
};

const uploadImages = async (req, res) => {
  if (!req.files) {
    throw new Error("Upload failed");
  }
  const productImage = req.files.image;
  if (!productImage.mimetype.startsWith("image")) {
    throw new Error("Wrong forma, please upload image");
  }

  const maxSize = 1024 * 1024;
  if (productImage.size > maxSize) {
    throw new Error("Please reduce image size - max size: 1MB");
  }
  const imagePath = path.join(
    __dirname,
    "../public/uploads/" + `${productImage.name}`
  );
  await productImage.mv(imagePath);
  res.status(200).json({ image: `/uploads/${productImage.name}` });
};

module.exports = {
  getAllProducts,
  getSingleProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadImages,
};
