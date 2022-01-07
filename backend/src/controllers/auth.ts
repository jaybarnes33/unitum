import User from "../models/User";
import { Request, Response } from "express";
import { createToken } from "../utils/Token";
import { validateEmail } from "../validators/user.validator";
import { normalizeGoogleData } from "../utils/dataNormalizer";
import { CustomRequest } from "../types/request";

export const register = async (req: Request, res: Response) => {
  const newUser = new User({
    ...req.body,
    authProvider: req.body.authProvider || "LOCAL",
    role: "active"
  });
  try {
    const savedUser = await newUser.save();
    const tokenData = await createToken(savedUser);
    res
      .status(201)
      .json({ message: "User Registered Successfully", data: tokenData });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const login = async (req: any, res: Response) => {
  const user = req.user;
  const isVerified = await user.verifyPassword(req.body.password);
  if (!isVerified)
    return res.status(400).json({ message: "Password is incorrect" });

  const tokenData = await createToken(user);
  return res.status(200).json({ ...tokenData });
};

export const checkAuthProvider = async (req: Request, res: Response) => {
  const valData = validateEmail(req.body);
  if (valData.error) {
    return res.status(400).json({
      message: "This field is invalid/required",
      errors: valData.error
    });
  }
  let dbUser;
  try {
    dbUser = await User.findOne({ email: valData.value.email }).select(
      "+authProvider"
    );
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong" });
  }
  if (!dbUser)
    return res
      .status(404)
      .json({ message: "User with this email does not exist" });

  return res
    .status(200)
    .json({ authProvider: dbUser.authProvider, email: dbUser.email });
};

type authProvider = "GOOGLE" | "FACEBOOK" | "TWITTER" | string;
export const externalAuth = async (req: any, res: Response) => {
  const provider: authProvider = req.body.authProvider;
  if (!provider) {
    return res.status(400).json({ message: "Authentication Provider not set" });
  }
  let userData;
  if (provider === "GOOGLE") {
    userData = await normalizeGoogleData(req.body);
  }

  let dbUser;
  try {
    dbUser = await User.findOne({ email: userData?.email }).select(
      "+authProvider"
    );
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong" });
  }
  let tokenData;
  if (!dbUser) {
    const newUser = new User({
      ...userData
    });
    try {
      const savedUser = await newUser.save();
      tokenData = await createToken(savedUser);
      return res.status(201).json({ ...tokenData });
    } catch (error) {
      return res.status(500).json({ message: "Something went wrong" });
    }
  }
  if (dbUser.authProvider !== userData?.authProvider) {
    return res.status(409).json({
      message: "User with this email is associated with a different provider"
    });
  }

  tokenData = await createToken(dbUser);
  return res.status(200).json({ ...tokenData });
};
