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
 

router.get('/manager-access', verifyToken, authorizeRole(1), (req, res) =>{
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

router.get('/all-access', verifyToken, (req, res) => {
  const role = Number(req.user.role);

  // allow accountant, manager, admin
  if (![0, 1, 2].includes(role)) {
    return res.status(403).json({ message: "Access denied" });
  }

  res.json(req.user);
});


export default router;


