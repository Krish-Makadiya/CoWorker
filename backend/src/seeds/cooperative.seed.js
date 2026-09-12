import mongoose from "mongoose";
import dotenv from "dotenv";

import { User } from "../models/user.model.js";
import { registerUser } from "../services/user.service.js";
import { Cooperative } from "../models/cooperative.model.js";
import { DB_NAME } from "../constants.js";

dotenv.config();

const cooperatives = [
  {
    email: "cooperative1@example.com",
    password: "Coop@12345",
    name: "Cooperative 1",
    mobileNumber: "9000000001",
    registrationNumber: "COOP-DEMO-001",
    address: {
      city: "Pune",
      state: "Maharashtra",
      pinCode: "411001",
    },
  },
  {
    email: "cooperative2@example.com",
    password: "Coop@6969",
    name: "Cooperative 2",
    mobileNumber: "9000000002",
    registrationNumber: "COOP-DEMO-002",
    address: {
      city: "Kolhapur",
      state: "Maharashtra",
      pinCode: "416001",
    },
  },
];

const seed = async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);

    console.log("Connected to MongoDB");
    console.log("Database:", mongoose.connection.name);
    console.log("Host:", mongoose.connection.host);

    // Clear existing data
    await Cooperative.deleteMany({});
    await User.deleteMany({});

    console.log("Deleted all users and cooperatives");

    // Seed cooperatives
    for (const data of cooperatives) {
      const user = await registerUser(
        data.email,
        data.password,
        data.name,
        data.mobileNumber,
        "cooperative"
      );

      await Cooperative.create({
        userId: user._id,
        name: data.name,
        registrationNumber: data.registrationNumber,
        address: data.address,
      });

      console.log(`Seeded: ${data.name}`);
    }

    console.log(`\nSuccessfully seeded ${cooperatives.length} cooperatives.`);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

seed();
