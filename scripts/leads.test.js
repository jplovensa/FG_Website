import { test } from "node:test";
import assert from "node:assert/strict";
import {
  normalizeInquiry,
  validContact,
  buildInquiryLink,
} from "../inquiry-model.js";
import handler from "../api/inquiry.js";
const brief = {
  name: "Ayu",
  contact: "+62 877 860 10290",
  interest: "FAD housing & workers’ accommodation",
  text: "A 24-unit community",
  project: "Lombok Housing Initiative",
  stage: "Site secured",
  scale: "24 homes",
  source: "project:housing",
  attribution: { utm_source: "portfolio", secret: "ignored" },
};
const request = (method, body) => ({
  method,
  body,
  headers: {
    host: "fjall.example",
    origin: "https://fjall.example",
    "content-type": "application/json",
  },
});
function response() {
  return {
    headers: {},
    setHeader(key, value) {
      this.headers[key] = value;
    },
    end(body) {
      this.body = JSON.parse(body);
    },
  };
}
test("contact accepts email or international phone and rejects invalid or excessive inputs", () => {
  for (const contact of ["ayu@example.com", "+62 (877) 860-10290"])
    assert.ok(validContact(contact));
  for (const contact of ["no address", "123", "user@", "1234567890123456"])
    assert.ok(!validContact(contact));
  assert.ok(normalizeInquiry(brief));
  for (const body of [
    { ...brief, name: " " },
    { ...brief, text: "" },
    { ...brief, website: "spam" },
    { ...brief, text: "a".repeat(2401) },
    { ...brief, contact: 42 },
    null,
  ])
    assert.equal(normalizeInquiry(body), null);
  assert.deepEqual(normalizeInquiry(brief).attribution, {
    utm_source: "portfolio",
  });
});
test("context and qualification survive the encoded WhatsApp handoff", () => {
  const fields = new FormData();
  for (const [key, value] of Object.entries(brief))
    if (typeof value === "string") fields.set(key, value);
  const draft = new URL(buildInquiryLink(fields)).searchParams.get("text");
  for (const text of [
    "Contact: +62 877 860 10290",
    "Inspired by: Lombok Housing Initiative",
    "Scale: 24 homes",
    "Project stage: Site secured",
  ])
    assert.ok(draft.includes(text));
  assert.ok(!draft.includes("utm_source"));
  assert.ok(!draft.includes("source:"));
});
test("inactive lead endpoint never acknowledges receipt; configured endpoint requires downstream success", async () => {
  const prior = process.env.LEAD_WEBHOOK_URL;
  const fetch = globalThis.fetch;
  try {
    delete process.env.LEAD_WEBHOOK_URL;
    let res = response();
    await handler(request("GET"), res);
    assert.deepEqual(res.body, { enabled: false });
    res = response();
    await handler(request("POST", brief), res);
    assert.equal(res.statusCode, 503);
    assert.ok(!res.body.accepted);
    process.env.LEAD_WEBHOOK_URL = "https://crm.example/inquiries";
    let posted;
    globalThis.fetch = async (url, options) => {
      posted = JSON.parse(options.body);
      assert.equal(url, process.env.LEAD_WEBHOOK_URL);
      return { ok: true };
    };
    res = response();
    await handler(request("POST", brief), res);
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.accepted, true);
    assert.equal(posted.project, brief.project);
    assert.ok(posted.reference);
    globalThis.fetch = async () => ({ ok: false });
    res = response();
    await handler(request("POST", brief), res);
    assert.equal(res.statusCode, 502);
    assert.ok(!res.body.accepted);
    res = response();
    await handler(
      {
        ...request("POST", brief),
        headers: {
          ...request("POST").headers,
          origin: "https://other.example",
        },
      },
      res,
    );
    assert.equal(res.statusCode, 403);
    res = response();
    await handler(request("POST", { ...brief, website: "bot" }), res);
    assert.equal(res.statusCode, 422);
  } finally {
    globalThis.fetch = fetch;
    if (prior === undefined) delete process.env.LEAD_WEBHOOK_URL;
    else process.env.LEAD_WEBHOOK_URL = prior;
  }
});
