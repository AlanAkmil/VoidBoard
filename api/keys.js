export default function handler(req, res) {
  // Hanya izinkan GET
  if (req.method !== "GET") return res.status(405).end();
  
  res.json({
    groq: process.env.GROQ_KEY || "",
    or:   process.env.OR_KEY   || "",
    gkey: process.env.GOOGLE_API_KEY || "",
    gcx:  process.env.GOOGLE_CX || "",
  });
}