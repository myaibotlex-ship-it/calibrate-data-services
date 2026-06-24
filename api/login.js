import { Buffer } from "node:buffer";

const PASSWORD = "Calibrate+PEPL";
const AUTH_TOKEN = "calibrate-pepl-v1";

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString("utf8");
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.statusCode = 405;
    res.setHeader("Allow", "POST");
    res.end("Method not allowed");
    return;
  }

  const body = await readBody(req);
  const params = new URLSearchParams(body);
  const password = params.get("password") || "";
  const nextPath = params.get("next") || "/";

  if (password !== PASSWORD) {
    res.statusCode = 303;
    res.setHeader("Location", "/login.html?error=1");
    res.end();
    return;
  }

  res.statusCode = 303;
  res.setHeader("Set-Cookie", `calibrate_site_auth=${AUTH_TOKEN}; Path=/; Max-Age=604800; SameSite=Lax; Secure`);
  res.setHeader("Location", nextPath.startsWith("http") ? "/" : nextPath);
  res.end();
}
