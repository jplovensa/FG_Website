import { randomUUID } from "node:crypto";
import { normalizeInquiry } from "../inquiry-model.js";
const reply = (res, status, body) => {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(body));
};
function configured() {
  try {
    return new URL(process.env.LEAD_WEBHOOK_URL).protocol === "https:";
  } catch {
    return false;
  }
}
export default async function handler(req, res) {
  if (req.method === "GET") return reply(res, 200, { enabled: configured() });
  if (req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    return reply(res, 405, { error: "Method not allowed" });
  }
  if (!configured())
    return reply(res, 503, { error: "Lead destination is not connected" });
  if (req.headers.origin) {
    try {
      if (new URL(req.headers.origin).host !== req.headers.host)
        return reply(res, 403, { error: "Origin not allowed" });
    } catch {
      return reply(res, 403, { error: "Origin not allowed" });
    }
  }
  if (!String(req.headers["content-type"] || "").startsWith("application/json"))
    return reply(res, 415, { error: "Use JSON" });
  let body = req.body;
  try {
    if (body === undefined) {
      let raw = "";
      for await (const chunk of req) {
        raw += chunk;
        if (Buffer.byteLength(raw) > 10000)
          return reply(res, 413, { error: "Brief is too large" });
      }
      body = JSON.parse(raw);
    }
    if (typeof body === "string") body = JSON.parse(body);
  } catch {
    return reply(res, 400, { error: "Invalid request" });
  }
  if (Buffer.byteLength(JSON.stringify(body)) > 10000)
    return reply(res, 413, { error: "Brief is too large" });
  const lead = normalizeInquiry(body);
  if (!lead)
    return reply(res, 422, {
      error: "Check your contact details and project brief",
    });
  const reference = randomUUID();
  try {
    const response = await fetch(process.env.LEAD_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.LEAD_WEBHOOK_TOKEN
          ? { Authorization: `Bearer ${process.env.LEAD_WEBHOOK_TOKEN}` }
          : {}),
      },
      body: JSON.stringify({
        type: "fjall.project-inquiry",
        reference,
        receivedAt: new Date().toISOString(),
        ...lead,
      }),
      signal: AbortSignal.timeout(8000),
      redirect: "error",
    });
    if (!response.ok)
      return reply(res, 502, { error: "Delivery was not confirmed" });
    return reply(res, 200, { accepted: true, reference });
  } catch {
    return reply(res, 502, { error: "Delivery was not confirmed" });
  }
}
