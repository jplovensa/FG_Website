import { test } from "node:test";
import assert from "node:assert/strict";
import { buildInquiryLink } from "../studio.js";

function fields(entries) {
  const form = new FormData();
  for (const [key, value] of Object.entries(entries)) form.set(key, value);
  return form;
}

test("WhatsApp inquiry preserves customer details and reserved characters in a draft to the commercial team", () => {
  const link = new URL(
    buildInquiryLink(
      fields({
        name: "  Ayu & Putra  ",
        email: "ayu+projects@example.com",
        company: "PT Design + Build",
        interest: "FAD housing & workers’ accommodation",
        location: "Jakarta / Bali #1",
        text: "12 homes & workers’ accommodation.\nA beachfront site + shared space.",
      }),
    ),
  );
  assert.equal(link.origin, "https://wa.me");
  assert.equal(link.pathname, "/6287786010290");
  assert.deepEqual([...link.searchParams.keys()], ["text"]);
  const draft = link.searchParams.get("text");
  for (const detail of [
    "Name: Ayu & Putra",
    "Email: ayu+projects@example.com",
    "Company: PT Design + Build",
    "Interest: FAD housing & workers’ accommodation",
    "Project location: Jakarta / Bali #1",
    "12 homes & workers’ accommodation.\nA beachfront site + shared space.",
  ]) {
    assert.ok(draft.includes(detail), `Draft must preserve ${detail}`);
  }
  assert.equal(
    link.hash,
    "",
    "Customer text must stay in the message, not become a URL fragment",
  );
});

test("WhatsApp draft omits blank optional fields", () => {
  const link = new URL(
    buildInquiryLink(
      fields({
        name: "Ayu",
        email: "ayu@example.com",
        company: "  ",
        interest: "RoR roof",
        location: "",
        text: "Please discuss a roof assembly.",
      }),
    ),
  );
  const draft = link.searchParams.get("text");
  assert.ok(!draft.includes("Company:"));
  assert.ok(!draft.includes("Project location:"));
  assert.ok(!draft.includes("undefined"));
  assert.ok(draft.includes("Interest: RoR roof"));
});
