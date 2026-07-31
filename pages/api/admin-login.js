import crypto from "crypto";

function tokenFor(password) {
  return crypto.createHash("sha256").update(`${password}:${process.env.ADMIN_COOKIE_SECRET || "voidboard"}`).digest("hex");
}

export default function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    return res.status(500).json({ error: "ADMIN_PASSWORD is not set in the project's environment variables." });
  }

  const { password } = req.body || {};
  if (password !== expected) {
    return res.status(401).json({ error: "Wrong password" });
  }

  const token = tokenFor(expected);
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  res.setHeader("Set-Cookie", `vb_admin=${token}; HttpOnly; Path=/; Max-Age=${60 * 60 * 24 * 7}; SameSite=Lax${secure}`);
  res.json({ ok: true });
}
