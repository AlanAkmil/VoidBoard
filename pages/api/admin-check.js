import crypto from "crypto";

function tokenFor(password) {
  return crypto.createHash("sha256").update(`${password}:${process.env.ADMIN_COOKIE_SECRET || "voidboard"}`).digest("hex");
}

export default function handler(req, res) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return res.json({ ok: false });
  const cookie = req.cookies?.vb_admin;
  res.json({ ok: cookie === tokenFor(expected) });
}
