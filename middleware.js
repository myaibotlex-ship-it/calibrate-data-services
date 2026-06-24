import { next } from "@vercel/functions";

const AUTH_COOKIE = "calibrate_site_auth";
const AUTH_TOKEN = "calibrate-pepl-v1";
const PUBLIC_PATHS = new Set(["/login.html", "/favicon.ico"]);

function hasAuthCookie(request) {
  const cookieHeader = request.headers.get("cookie") || "";
  return cookieHeader
    .split(";")
    .map((cookie) => cookie.trim())
    .some((cookie) => cookie === `${AUTH_COOKIE}=${AUTH_TOKEN}`);
}

export default function middleware(request) {
  const url = new URL(request.url);

  if (PUBLIC_PATHS.has(url.pathname) || hasAuthCookie(request)) {
    return next();
  }

  url.pathname = "/login.html";
  url.searchParams.set("next", `${new URL(request.url).pathname}${new URL(request.url).search}`);
  return Response.redirect(url, 307);
}

export const config = {
  runtime: "edge",
};
