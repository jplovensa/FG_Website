export function buildInquiryLink(fields) {
  const value = (key) => String(fields.get(key) || "").trim();
  const rows = [
    ["Name", "name"],
    ["Contact", "contact"],
    ["Email", "email"],
    ["Company", "company"],
    ["Interest", "interest"],
    ["Project location", "location"],
    ["Inspired by", "project"],
    ["Project stage", "stage"],
    ["Scale", "scale"],
    ["Preferred timing", "timing"],
  ];
  const message = [
    "Hello Fjäll Group, I’d like to discuss a project.",
    "",
    ...rows
      .filter(([, key]) => value(key))
      .map(([label, key]) => `${label}: ${value(key)}`),
    "",
    value("text"),
  ].join("\n");
  const url = new URL("https://wa.me/6287786010290");
  url.searchParams.set("text", message);
  return url.href;
}
export function validContact(value) {
  return (
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ||
    (/^[+\d\s().-]+$/.test(value) &&
      value.replace(/\D/g, "").length >= 8 &&
      value.replace(/\D/g, "").length <= 15)
  );
}
export function normalizeInquiry(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) return null;
  const limits = {
    name: 100,
    contact: 180,
    company: 140,
    interest: 100,
    location: 160,
    project: 180,
    stage: 100,
    scale: 120,
    timing: 120,
    text: 2400,
    source: 200,
    website: 200,
  };
  const result = {};
  for (const [key, max] of Object.entries(limits)) {
    if (body[key] !== undefined && typeof body[key] !== "string") return null;
    const value = (body[key] || "").trim();
    if (value.length > max) return null;
    result[key] = value;
  }
  if (
    !result.name ||
    !validContact(result.contact) ||
    !result.text ||
    result.website
  )
    return null;
  const allowed = [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_content",
    "utm_term",
  ];
  result.attribution = {};
  for (const key of allowed)
    if (typeof body.attribution?.[key] === "string")
      result.attribution[key] = body.attribution[key].slice(0, 180);
  return result;
}
