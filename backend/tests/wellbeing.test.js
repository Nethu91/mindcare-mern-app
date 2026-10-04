const { test } = require("node:test");
const assert = require("node:assert/strict");
const express = require("express");
const { Journal, Preferences, Center } = require("../models/Wellbeing");
const Appointment = require("../models/Appointment");
require.cache[require.resolve("../middleware/authMiddleware")] = {
  exports: {
    protect: (req, res, next) => {
      if (!req.headers.authorization) return res.sendStatus(401);
      req.user = { _id: "user-one" };
      next();
    },
  },
};
const prefs = {
  daily: true,
  affirmations: true,
  sessions: true,
  timeZone: "Asia/Colombo",
  readIds: [],
  save: async () => {},
};
Preferences.findOneAndUpdate = async () => prefs;
let created, deleted, readUpdate, appointmentQuery;
Journal.find = (q) => {
  assert.equal(q.userId, "user-one");
  return { sort: async () => [] };
};
Journal.create = async (data) => {
  created = data;
  return data;
};
Journal.findOneAndDelete = async (q) => {
  deleted = q;
  return null;
};
Preferences.updateOne = async (q, u) => {
  readUpdate = { q, u };
};
Appointment.find = (q) => {
  appointmentQuery = q;
  return {
    sort: () => ({
      limit: async () => [
        { _id: "a1", date: "2099-01-01", time: "10:00", status: "Accepted" },
      ],
    }),
  };
};
Center.find = () => ({
  sort: () => ({
    limit: async () => [
      {
        _id: "center-one",
        name: "Verified center",
        address: "Town",
        updatedAt: new Date("2026-10-03"),
      },
    ],
    then: (resolve) => resolve([]),
  }),
});
const app = express();
app.use(express.json());
app.use("/api/wellbeing", require("../routes/wellbeingRoutes"));
test("wellbeing endpoints validate input and isolate account data", async () => {
  const server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  const url = `http://127.0.0.1:${server.address().port}/api/wellbeing`;
  const call = (path, method = "GET", body, auth = true) =>
    fetch(url + path, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(auth ? { Authorization: "Bearer test" } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
  try {
    assert.equal((await call("/journal", "GET", undefined, false)).status, 401);
    assert.equal(
      (
        await call("/journal", "POST", {
          title: "",
          content: "x",
          mood: "Happy",
        })
      ).status,
      400,
    );
    assert.equal(
      (
        await call("/journal", "POST", {
          title: "Reflection",
          content: "Today",
          mood: "Happy",
          userId: "someone-else",
        })
      ).status,
      201,
    );
    assert.equal(created.userId, "user-one");
    assert.equal((await call("/journal/not-mine", "DELETE")).status, 404);
    assert.equal(deleted.userId, "user-one");
    assert.deepEqual(await (await call("/journal")).json(), []);
    const items = await (await call("/notifications")).json();
    assert.equal(items.length, 4);
    assert.equal(appointmentQuery.userId, "user-one");
    assert.deepEqual(appointmentQuery.status.$in, ["Pending", "Accepted"]);
    assert.equal(items[2].path, "/appointments");
    assert.equal(items[3].path, "/meditation-centers?center=center-one");
    assert.equal(
      (await call("/notifications/read", "PATCH", { ids: [{}] })).status,
      400,
    );
    assert.equal(
      (await call("/notifications/read", "PATCH", { ids: [items[0].id] }))
        .status,
      200,
    );
    assert.equal(readUpdate.q.userId, "user-one");
    assert.equal(
      (await call("/preferences", "PATCH", { daily: "yes" })).status,
      400,
    );
    assert.equal(
      (await call("/preferences", "PATCH", { quietStart: "99:00" })).status,
      400,
    );
    assert.equal(
      (await call("/preferences", "PATCH", { timeZone: "Invalid/Zone" }))
        .status,
      400,
    );
    assert.equal(
      (await call("/preferences", "PATCH", { daily: false })).status,
      200,
    );
    assert.equal((await (await call("/notifications")).json()).length, 3);
    assert.deepEqual(await (await call("/centers")).json(), []);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
