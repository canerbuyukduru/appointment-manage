import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import generateToken from "../utils/createToken.js";


const createUser = async (req, res) => {
  const { full_name, email, password, phone, role } = req.body;

  try {
    const newUser = new User({ full_name, email, password, phone, role });

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
export { createUser, loginUser, logOutUser };