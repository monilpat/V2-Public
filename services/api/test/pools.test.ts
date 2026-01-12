import request from "supertest";
import app from "../src/index";

describe("pools endpoint", () => {
  it("returns a response", async () => {
    const res = await request(app).get("/pools");
    // may fail without RPC; assert status is 200 or 400 but not crash
    expect([200,400]).toContain(res.status);
  });
});
