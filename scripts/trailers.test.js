import { test } from "node:test";
import assert from "node:assert/strict";
import { getTrailerShot, trailerDuration } from "../trailer-player.js";

test("cinematic shots move the camera and finish at the business end card", () => {
  assert.equal(trailerDuration, 18);
  for (const kind of ["greenshift", "fad"]) {
    assert.notDeepEqual(
      getTrailerShot(kind, 0).eye,
      getTrailerShot(kind, 2).eye,
    );
    assert.equal(getTrailerShot(kind, 18).endCard, true);
    assert.equal(getTrailerShot(kind, 18).stage, 4);
    for (let time = 0; time <= 18; time += 0.25) {
      const shot = getTrailerShot(kind, time);
      assert.ok(shot.eye.every(Number.isFinite));
      assert.ok(shot.target.every(Number.isFinite));
      assert.ok(shot.stage >= 0 && shot.stage <= 4);
    }
  }
});
test("FAD moves from an individual system to a twelve-home community", () => {
  assert.equal(getTrailerShot("fad", 1).units, 1);
  assert.equal(getTrailerShot("fad", 8).units, 6);
  assert.equal(getTrailerShot("fad", 13).units, 12);
  assert.equal(getTrailerShot("greenshift", 13).environment, "beach");
  assert.equal(getTrailerShot("fad", 13).environment, "forest");
});
