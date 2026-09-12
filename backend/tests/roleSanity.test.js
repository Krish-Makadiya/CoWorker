import { jest, describe, test, expect, beforeAll, afterAll } from "@jest/globals";
import request from "supertest";
import mongoose from "mongoose";
import { app } from "../src/app.js";
import { User } from "../src/models/user.model.js";
import { Customer } from "../src/models/customer.model.js";
import { Worker } from "../src/models/worker.model.js";
import { Cooperative } from "../src/models/cooperative.model.js";
import { ServiceRequest } from "../src/models/serviceRequest.model.js";

const MOCK_IDS = {
  customer: "60f71b2f9f1b2c001f8e4a01",
  worker: "60f71b2f9f1b2c001f8e4a02",
  cooperative: "60f71b2f9f1b2c001f8e4a03",
  otherWorker: "60f71b2f9f1b2c001f8e4a04",
  otherCooperative: "60f71b2f9f1b2c001f8e4a05",
  targetWorker: "60f71b2f9f1b2c001f8e4a3b",
};

const mockUsers = {
  [MOCK_IDS.customer]: {
    _id: new mongoose.Types.ObjectId(MOCK_IDS.customer),
    name: "Customer User",
    email: "customer@example.com",
    roles: ["customer"],
  },
  [MOCK_IDS.worker]: {
    _id: new mongoose.Types.ObjectId(MOCK_IDS.worker),
    name: "Worker User",
    email: "worker@example.com",
    roles: ["worker"],
  },
  [MOCK_IDS.otherWorker]: {
    _id: new mongoose.Types.ObjectId(MOCK_IDS.otherWorker),
    name: "Other Worker User",
    email: "otherworker@example.com",
    roles: ["worker"],
  },
  [MOCK_IDS.cooperative]: {
    _id: new mongoose.Types.ObjectId(MOCK_IDS.cooperative),
    name: "Cooperative User",
    email: "cooperative@example.com",
    roles: ["cooperative"],
  },
  [MOCK_IDS.otherCooperative]: {
    _id: new mongoose.Types.ObjectId(MOCK_IDS.otherCooperative),
    name: "Other Cooperative User",
    email: "othercooperative@example.com",
    roles: ["cooperative"],
  },
};

let consoleSpy;

beforeAll(() => {
  // Suppress console.error output from errorMiddleware during test runs
  consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

  User.findById = jest.fn(async (id) => mockUsers[id] || null);
  Customer.findOne = jest.fn(async () => null);

  const createMockChain = (val = null) => {
    const chain = {
      populate: () => chain,
      sort: () => chain,
      then: (resolve) => resolve(val),
    };
    return chain;
  };

  // Mock Workers & Cooperatives for ownership & list/delete tests
  Worker.findById = jest.fn((id) => {
    const chain = {
      populate: () => chain,
      then: (resolve) => {
        if (id === MOCK_IDS.targetWorker) {
          resolve({
            _id: new mongoose.Types.ObjectId(MOCK_IDS.targetWorker),
            userId: new mongoose.Types.ObjectId(MOCK_IDS.worker),
            cooperativeId: new mongoose.Types.ObjectId("60f71b2f9f1b2c001f8e4a99"),
            skills: ["plumbing"],
          });
        } else {
          resolve(null);
        }
      },
    };
    return chain;
  });

  Worker.find = jest.fn(() => createMockChain([]));
  Worker.findOneAndDelete = jest.fn(async () => null);

  Worker.findOne = jest.fn(async (query) => {
    if (query.userId?.toString() === MOCK_IDS.worker) {
      return {
        _id: new mongoose.Types.ObjectId(MOCK_IDS.targetWorker),
        userId: new mongoose.Types.ObjectId(MOCK_IDS.worker),
      };
    }
    if (query.userId?.toString() === MOCK_IDS.otherWorker) {
      return {
        _id: new mongoose.Types.ObjectId("60f71b2f9f1b2c001f8e4a88"),
        userId: new mongoose.Types.ObjectId(MOCK_IDS.otherWorker),
      };
    }
    return null;
  });

  Cooperative.findOne = jest.fn(async (query) => {
    if (query.userId?.toString() === MOCK_IDS.cooperative) {
      return {
        _id: new mongoose.Types.ObjectId("60f71b2f9f1b2c001f8e4a99"),
        userId: new mongoose.Types.ObjectId(MOCK_IDS.cooperative),
      };
    }
    if (query.userId?.toString() === MOCK_IDS.otherCooperative) {
      return {
        _id: new mongoose.Types.ObjectId("60f71b2f9f1b2c001f8e4a77"),
        userId: new mongoose.Types.ObjectId(MOCK_IDS.otherCooperative),
      };
    }
    return null;
  });

  ServiceRequest.findById = jest.fn(() => createMockChain(null));
  ServiceRequest.find = jest.fn(() => createMockChain([]));
});

afterAll(() => {
  if (consoleSpy) {
    consoleSpy.mockRestore();
  }
});

const routesToTest = [
  // Cooperative Role Required
  { method: "put", path: "/cooperative/profile", allowedRoles: ["cooperative"] },
  { method: "get", path: "/worker/", allowedRoles: ["cooperative"] },
  { method: "post", path: "/worker/register-by-cooperative", allowedRoles: ["cooperative"] },
  { method: "put", path: "/worker/60f71b2f9f1b2c001f8e4a3b", allowedRoles: ["cooperative"] },
  { method: "delete", path: "/worker/60f71b2f9f1b2c001f8e4a3b", allowedRoles: ["cooperative"] },
  { method: "patch", path: "/worker/60f71b2f9f1b2c001f8e4a3b/verify", allowedRoles: ["cooperative"] },

  // Worker or Cooperative Role Required
  { method: "get", path: "/worker/60f71b2f9f1b2c001f8e4a3b", allowedRoles: ["worker", "cooperative"] },

  // Customer Role Required
  { method: "post", path: "/api/service-requests/", allowedRoles: ["customer"] },
  { method: "get", path: "/api/service-requests/my", allowedRoles: ["customer"] },
  { method: "post", path: "/api/service-requests/60f71b2f9f1b2c001f8e4a3b/pre-photos", allowedRoles: ["customer"] },
  { method: "patch", path: "/api/service-requests/60f71b2f9f1b2c001f8e4a3b/cancel", allowedRoles: ["customer"] },

  // Worker Role Required
  { method: "get", path: "/api/service-requests/available", allowedRoles: ["worker"] },
  { method: "post", path: "/api/service-requests/60f71b2f9f1b2c001f8e4a3b/post-photos", allowedRoles: ["worker"] },
  { method: "patch", path: "/api/service-requests/60f71b2f9f1b2c001f8e4a3b/accept", allowedRoles: ["worker"] },
  { method: "patch", path: "/api/service-requests/60f71b2f9f1b2c001f8e4a3b/start", allowedRoles: ["worker"] },
  { method: "patch", path: "/api/service-requests/60f71b2f9f1b2c001f8e4a3b/complete", allowedRoles: ["worker"] },

  // Customer or Worker Role Required
  { method: "get", path: "/api/service-requests/60f71b2f9f1b2c001f8e4a3b", allowedRoles: ["customer", "worker"] },
];

const allRoles = ["customer", "worker", "cooperative"];

describe("Role Authorization Sanity Check (Jest)", () => {
  routesToTest.forEach((route) => {
    const routeTitle = `${route.method.toUpperCase()} ${route.path}`;

    describe(`Route: ${routeTitle}`, () => {
      test("rejects unauthenticated requests (missing user-id header) with 401", async () => {
        const res = await request(app)[route.method](route.path);
        expect(res.status).toBe(401);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe("Unauthorized");
      });

      const forbiddenRoles = allRoles.filter(
        (role) => !route.allowedRoles.includes(role)
      );

      forbiddenRoles.forEach((role) => {
        test(`rejects role '${role}' with 403 Forbidden`, async () => {
          const userId = MOCK_IDS[role];
          const res = await request(app)
            [route.method](route.path)
            .set("user-id", userId);
          expect(res.status).toBe(403);
          expect(res.body.success).toBe(false);
        });
      });

      route.allowedRoles.forEach((role) => {
        test(`allows role '${role}' to pass auth and role middleware`, async () => {
          const userId = MOCK_IDS[role];
          const res = await request(app)
            [route.method](route.path)
            .set("user-id", userId);
          expect(res.status).not.toBe(401);
          expect(res.status).not.toBe(403);
        });
      });
    });
  });
});

describe("GET /worker/:id Ownership & Cooperative Association Logic", () => {
  test("allows worker to view their own profile", async () => {
    const res = await request(app)
      .get(`/worker/${MOCK_IDS.targetWorker}`)
      .set("user-id", MOCK_IDS.worker);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.worker._id).toBe(MOCK_IDS.targetWorker);
  });

  test("rejects worker trying to view another worker's profile with 403", async () => {
    const res = await request(app)
      .get(`/worker/${MOCK_IDS.targetWorker}`)
      .set("user-id", MOCK_IDS.otherWorker);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain("You are not authorized to view this worker's profile");
  });

  test("allows cooperative to view a worker registered under them", async () => {
    const res = await request(app)
      .get(`/worker/${MOCK_IDS.targetWorker}`)
      .set("user-id", MOCK_IDS.cooperative);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.worker._id).toBe(MOCK_IDS.targetWorker);
  });

  test("rejects cooperative trying to view a worker from a different cooperative with 403", async () => {
    const res = await request(app)
      .get(`/worker/${MOCK_IDS.targetWorker}`)
      .set("user-id", MOCK_IDS.otherCooperative);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain("You are not authorized to view this worker's profile");
  });

  test("rejects customer attempting to view worker details via GET /worker/:id with 403", async () => {
    const res = await request(app)
      .get(`/worker/${MOCK_IDS.targetWorker}`)
      .set("user-id", MOCK_IDS.customer);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain("Requires worker or cooperative role");
  });
});
