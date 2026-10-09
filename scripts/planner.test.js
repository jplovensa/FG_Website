import test from 'node:test';
import assert from 'node:assert/strict';
import { createPlan, planBrief, planInterest, mergePlanNotes, planningStages } from '../journey-planner.js';
import { buildInquiryLink } from '../inquiry-model.js';

test('personal project choices reach the WhatsApp draft without unselected answers', () => {
  const plan = createPlan();
  Object.assign(plan, { type: 'housing', location: 'Bali & Lombok', scale: '250+ homes', timing: '2027', choices: [1, null, 1, 1, 1] });
  const url = new URL(buildInquiryLink(new Map([['interest', planInterest(plan.type)], ['text', planBrief(plan)]])));
  const draft = url.searchParams.get('text');
  assert.equal(url.pathname, '/6287786010290');
  for (const text of ['Mass-scale housing', 'Bali & Lombok', '250+ homes', '2027', 'Repeatable spaces', 'A phased programme', 'FAD housing']) assert.ok(draft.includes(text));
  assert.ok(!draft.includes(planningStages[1].question));
  assert.ok(!draft.includes('undefined'));
  assert.equal(planInterest('retrofit'), 'Retrofit project');
});

test('updating the planner replaces its prior brief while retaining visitor-written notes', () => {
  const first = 'My project: A home.';
  const second = 'My project: Mass-scale housing.';
  const notes = 'Please retain the trees on our site.';
  const initial = mergePlanNotes(notes, '', first);
  assert.equal(mergePlanNotes(initial, first, second), `${notes}\n\n${second}`);
  assert.equal(mergePlanNotes(second, second, second), second);
  assert.equal(mergePlanNotes('x'.repeat(2400), '', second).length, 2400);
});
