export default function handler(req, res) {
  res.setHeader("Set-Cookie", `vb_admin=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax`);
  res.json({ ok: true });
}
