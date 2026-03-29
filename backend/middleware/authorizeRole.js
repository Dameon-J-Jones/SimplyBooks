
export default function authorizeRole(...allowedRoles) {
  return (req, res, next) => {
    console.log("req.user:", req.user);

    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(401).json({ error: "Access Denied" });
    }

    next();
  };
}