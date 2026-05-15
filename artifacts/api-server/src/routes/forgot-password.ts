import { Router } from "express";
import crypto from "crypto";
import { User } from "../models/User";
import { sendPasswordResetEmail } from "../lib/email";

const router = Router();

// 🔥 IMPORTANT: route is "/"
router.post("/", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);

    await user.save();

    await sendPasswordResetEmail(
      user.email,
      resetToken,
      user.name
    );

    return res.json({
      success: true,
      message: "Reset email sent",
    });
  } catch (err) {
    console.error("Forgot password error:", err);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
});

export default router;