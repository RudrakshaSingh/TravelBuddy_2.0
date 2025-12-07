import User from "../models/userModel.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/AsyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

export const registerUser = asyncHandler(async (req, res, next) => {
  let { clerk_id, fullName, email, mobile, password, dob, gender } = req.body;

  // --------------------- REQUIRED FIELD VALIDATION ---------------------
  if (
    !clerk_id ||
    !fullName ||
    !email ||
    !mobile ||
    !password ||
    !dob ||
    !gender
  ) {
    throw new ApiError(400, "All required fields must be provided");
  }

  // --------------------- TRIM NAME ---------------------
  fullName = fullName.trim();

  // FULL NAME MUST NOT BE EMPTY AFTER TRIM
  if (fullName === "") {
    throw new ApiError(400, "Full name cannot be empty");
  }

  // --------------------- EMAIL VALIDATION ---------------------
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ApiError(400, "Invalid email format");
  }

  // --------------------- MOBILE NUMBER VALIDATION (10 digits only) ---------------------
  if (!/^\d{10}$/.test(mobile)) {
    throw new ApiError(400, "Mobile number must be exactly 10 digits");
  }

  // --------------------- DOB VALIDATION (not future date) ---------------------
  const inputDob = new Date(dob);
  const today = new Date();

  if (isNaN(inputDob.getTime())) {
    throw new ApiError(400, "Invalid date format for DOB");
  }

  if (inputDob > today) {
    throw new ApiError(400, "DOB cannot be greater than today's date");
  }

  // --------------------- GENDER VALIDATION ---------------------
  const allowedGenders = ["Male", "Female", "Other"];
  if (!allowedGenders.includes(gender)) {
    throw new ApiError(400, "Gender must be Male, Female, or Other");
  }

  // --------------------- UNIQUE EMAIL CHECK ---------------------
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(400, "Email already exists");
  }

  // --------------------- CREATE USER ---------------------
  const user = await User.create({
    clerk_id,
    fullName,
    email,
    mobile,
    password,
    dob: inputDob,
    gender,
  });

  // --------------------- GENERATE JWT TOKEN ---------------------
  const token = user.generateJwtToken();

  // --------------------- SEND RESPONSE ---------------------
  return res
    .status(201)
    .json(
      new ApiResponse(201, { user, token }, "User registered successfully")
    );
});
