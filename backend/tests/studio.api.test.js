import "./helpers/testEnv.js";

import test, { before, after } from "node:test";
import assert from "node:assert";
import mongoose from "mongoose";
import { MongoMemoryReplSet } from "mongodb-memory-server";

let mongod;
let server;
let baseUrl;

before(async () => {
  mongod = await MongoMemoryReplSet.create({
    replSet: { count: 1 }
  });
  const uri = mongod.getUri();
  await mongoose.connect(uri);

  const { default: app } = await import("../src/app.js");
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      baseUrl = `http://127.0.0.1:${server.address().port}`;
      resolve();
    });
  });
});

after(async () => {
  if (server) await new Promise((resolve) => server.close(resolve));
  await mongoose.disconnect();
  if (mongod) await mongod.stop();
});

const registerStudio = async (username, email, studioName) => {
  const res = await fetch(`${baseUrl}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username,
      email,
      password: "password123",
      studioName,
    }),
  });
  return res.json();
};

test("Studio API - Get Profile and Update Studio Name with validation", async () => {
  const { token, studio } = await registerStudio("studio_user", "studio@example.com", "Studio Alpha");
  assert.ok(token);
  assert.strictEqual(studio.name, "Studio Alpha");

  // Get Studio profile
  const profileRes = await fetch(`${baseUrl}/api/studios/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  assert.strictEqual(profileRes.status, 200);
  const profile = await profileRes.json();
  assert.strictEqual(profile.success, true);
  assert.strictEqual(profile.studio.name, "Studio Alpha");

  // Update Studio profile with valid name
  const updateRes = await fetch(`${baseUrl}/api/studios/profile`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name: "Studio Beta" }),
  });
  assert.strictEqual(updateRes.status, 200);
  const updateResult = await updateRes.json();
  assert.strictEqual(updateResult.success, true);
  assert.strictEqual(updateResult.studio.name, "Studio Beta");

  // Update Studio profile with invalid name (too short)
  const invalidRes = await fetch(`${baseUrl}/api/studios/profile`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name: "St" }),
  });
  assert.strictEqual(invalidRes.status, 400); // Validation failure
});
