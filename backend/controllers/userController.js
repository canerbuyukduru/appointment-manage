import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import generateToken from "../utils/createToken.js";
import BeautyCenter from '../models/beautyCentersModel.js';

const createUser = async (req, res) => {
  const { full_name, email, password, phone, role } = req.body;

  try {
    // Email format kontrolü
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Geçerli bir email adresi giriniz.' });
    }
    // Email kontrolü
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Bu email zaten kayıtlı.' });
    }

    // Şifre hashle
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ full_name, email, password: hashedPassword, phone, role });
    await newUser.save();
    // Generate JWT token after user creation
    const token = generateToken(res, newUser._id);
    res.status(201).json({ message: "User created successfully", user: newUser, token });
  } catch (error) {
    res.status(500).json({ message: "Error creating user", error });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        if (!existingUser) {
            return res.status(404).json({ message: "User not found" });
        }

        // Password comparison logic here
        const isMatch = await bcrypt.compare(password, existingUser.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
       
        // Generate JWT token after successful login
        const token = generateToken(res, existingUser._id);
        // If login is successful, you can return user data or a token
        res.status(200).json({ message: "Login successful", user: existingUser, token });
    } catch (error) {
        res.status(500).json({ message: "Error logging in", error });
    }
}

const  logOutUser = async (req, res) => {
    res.cookie("jwt", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV !== "development",
        sameSite: "strict",
        maxAge: 0, // Set maxAge to 0 to delete the cookie
    });
    res.status(200).json({ message: "User logged out successfully" });

}

const registerOwner = async (req, res) => {
  try {
    const {
      full_name,
      email,
      password,
      phone,

      // Beauty center fields:
      center_name,
      address,
      location,
      description,
      center_phone,
      center_email
    } = req.body;

    // Email format kontrolü
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Geçerli bir email adresi giriniz.' });
    }
    // Email kontrolü
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Bu email zaten kayıtlı.' });
    }

    // Şifre hashle
    const hashedPassword = await bcrypt.hash(password, 10);

    // 1. Adım: User kaydı
    const newUser = await User.create({
      full_name,
      email,
      password: hashedPassword,
      phone,
      role: 'owner',
      isBanned: false
    });

    // 2. Adım: BeautyCenter kaydı
    const newCenter = await BeautyCenter.create({
      name: center_name,
      address,
      location,
      phone: center_phone,
      email: center_email,
      description,
      userId: newUser._id,
      isApproved: false // Admin onayı gerekecek
    });

    // JWT token oluştur
    const token = generateToken(res, newUser._id);

    return res.status(201).json({
      message: 'Kayıt başarıyla alındı. Onay sürecine gönderildi.',
      userId: newUser._id,
      beautyCenterId: newCenter._id,
      token
    });
  } catch (error) {
    console.error('Register Owner Hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası. Kayıt yapılamadı.' });
  }
};


const registerAdmin = async (req, res) => {
  const { full_name, email, password, phone } = req.body;

  try {
    // Email format kontrolü
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Geçerli bir email adresi giriniz.' });
    }
    // Email kontrolü
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Bu email zaten kayıtlı.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ full_name, email, password: hashedPassword, phone, role: 'admin' });
    await newUser.save();

    // JWT token oluştur
    const token = generateToken(res, newUser._id);

    res.status(201).json({ message: "Admin created successfully", user: newUser, token });
  } catch (error) {
    res.status(500).json({ message: "Error creating admin", error });
  }


};


const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password -__v");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user", error });
  }
};


const updateCurrentUser = async (req, res) => {
  const { full_name, email, phone, password } = req.body;

  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Güncelleme işlemleri
    if (full_name !== undefined) user.full_name = full_name;
    if (email !== undefined) user.email = email;
    if (phone !== undefined) user.phone = phone;
    if (password !== undefined) user.password = await bcrypt.hash(password, 10);

    await user.save();
    res.status(200).json({ message: "User updated successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Error updating user", error });
  }
};


// Adminlerin sahiplerini listelemesi için bir endpoint
const getOwners = async (req, res) => {
  try {
    const owners = await User.find({ role: 'owner' }).select('-password -__v');
    res.status(200).json(owners);
  } catch (error) {
    res.status(500).json({ message: "Error fetching owners", error });
  }
};



export { createUser, loginUser, logOutUser, registerOwner, registerAdmin, getOwners,getCurrentUser,updateCurrentUser};