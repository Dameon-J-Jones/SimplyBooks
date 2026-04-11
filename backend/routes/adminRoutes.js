import express from "express";
import { suspendUser } from "../controllers/adminController.js";
import verifyToken from "../middleware/verifyToken.js";
import authorizeRole from "../middleware/authorizeRole.js";
import { sendEmail } from "../sendEmails.js";

const router = express.Router();
router.post("/suspend", suspendUser);



router.get('/admin-access', verifyToken, authorizeRole(2), (req, res) =>{
    res.json(req.user)
})

router.get('/accountant-access', verifyToken, authorizeRole(0), (req, res) =>{
    res.json(req.user)
})


router.get('/manager', verifyToken, authorizeRole(1), (req, res) =>{
    res.json(req.user)
})


router.get("/test-email", async (req, res) => {
  try {
    await sendEmail({
      to: "boomtownboss11@gmail.com",
      subject: "Test email",
      text: "If you got this, your email sender works.",
      html: "<h2>If you got this, your email sender works.</h2>",
    });

    res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("EMAIL ERROR:", error);
    res.status(500).json({ message: "Email failed", error: error.message });
  }
});



export default router;


