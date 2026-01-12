import request from "supertest";
import app from "../src/index";

describe("API smoke", () => {
  it("returns composition failure without pool", async () => {
    const res = await request(app).get("/poolComposition");
    expect(res.status).toBeGreaterThanOrEqual(400);
  });
});
