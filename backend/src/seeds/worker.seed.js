import mongoose from "mongoose";
import dotenv from "dotenv";

import { User } from "../models/user.model.js";
import { registerUser } from "../services/user.service.js";
import { Worker } from "../models/worker.model.js";
import { DB_NAME } from "../constants.js";

dotenv.config();

const COOPERATIVE_IDS = [
  "6aa2f9017065523088c943fb",
  "6aa2f9027065523088c943fd",
];

const workers = [
  {
    email: "worker1@example.com",
    password: "Worker@12345",
    name: "Rahul Patil",
    mobileNumber: "9000001001",
    skills: ["Plumbing", "Pipe Fitting"],
    experience: 5,
    certifications: ["ITI Plumbing"],
    verification: "verified",
    address: "Pune, Maharashtra",
    rating: 4.5,
  },
  {
    email: "worker2@example.com",
    password: "Worker@12345",
    name: "Amit Shinde",
    mobileNumber: "9000001002",
    skills: ["Electrical", "Wiring"],
    experience: 4,
    certifications: ["ITI Electrician"],
    verification: "verified",
    address: "Kolhapur, Maharashtra",
    rating: 4.2,
  },
  {
    email: "worker3@example.com",
    password: "Worker@12345",
    name: "Sagar Jadhav",
    mobileNumber: "9000001003",
    skills: ["Carpentry", "Furniture Repair"],
    experience: 7,
    certifications: [],
    verification: "verified",
    address: "Satara, Maharashtra",
    rating: 4.7,
  },
  {
    email: "worker4@example.com",
    password: "Worker@12345",
    name: "Prakash More",
    mobileNumber: "9000001004",
    skills: ["Painting", "Wall Finishing"],
    experience: 6,
    certifications: ["Painting Certification"],
    verification: "verified",
    address: "Sangli, Maharashtra",
    rating: 4.3,
  },
  {
    email: "worker5@example.com",
    password: "Worker@12345",
    name: "Vijay Kadam",
    mobileNumber: "9000001005",
    skills: ["Masonry", "Construction"],
    experience: 9,
    certifications: ["Construction Safety"],
    verification: "verified",
    address: "Pune, Maharashtra",
    rating: 4.8,
  },
  {
    email: "worker6@example.com",
    password: "Worker@12345",
    name: "Nikhil Pawar",
    mobileNumber: "9000001006",
    skills: ["AC Repair", "Appliance Repair"],
    experience: 3,
    certifications: ["HVAC Certification"],
    verification: "pending",
    address: "Kolhapur, Maharashtra",
    rating: 4.0,
  },
  {
    email: "worker7@example.com",
    password: "Worker@12345",
    name: "Rohit Chavan",
    mobileNumber: "9000001007",
    skills: ["Welding", "Metal Fabrication"],
    experience: 8,
    certifications: ["Welding Certification"],
    verification: "verified",
    address: "Pune, Maharashtra",
    rating: 4.6,
  },
  {
    email: "worker8@example.com",
    password: "Worker@12345",
    name: "Mahesh Desai",
    mobileNumber: "9000001008",
    skills: ["Gardening", "Landscaping"],
    experience: 4,
    certifications: [],
    verification: "verified",
    address: "Kolhapur, Maharashtra",
    rating: 4.1,
  },
  {
    email: "worker9@example.com",
    password: "Worker@12345",
    name: "Akash Bhosale",
    mobileNumber: "9000001009",
    skills: ["Tiling", "Flooring"],
    experience: 5,
    certifications: ["Tile Installation"],
    verification: "verified",
    address: "Satara, Maharashtra",
    rating: 4.4,
  },
  {
    email: "worker10@example.com",
    password: "Worker@12345",
    name: "Ganesh Salunkhe",
    mobileNumber: "9000001010",
    skills: ["Plumbing", "Bathroom Fitting"],
    experience: 10,
    certifications: ["ITI Plumbing"],
    verification: "verified",
    address: "Pune, Maharashtra",
    rating: 4.9,
  },
  {
    email: "worker11@example.com",
    password: "Worker@12345",
    name: "Swapnil Mane",
    mobileNumber: "9000001011",
    skills: ["Electrical", "Solar Installation"],
    experience: 6,
    certifications: ["Solar Technician"],
    verification: "verified",
    address: "Kolhapur, Maharashtra",
    rating: 4.5,
  },
  {
    email: "worker12@example.com",
    password: "Worker@12345",
    name: "Amol Gawade",
    mobileNumber: "9000001012",
    skills: ["Carpentry", "Wood Polishing"],
    experience: 5,
    certifications: [],
    verification: "pending",
    address: "Sangli, Maharashtra",
    rating: 3.9,
  },
  {
    email: "worker13@example.com",
    password: "Worker@12345",
    name: "Sachin Khot",
    mobileNumber: "9000001013",
    skills: ["Painting", "Waterproofing"],
    experience: 7,
    certifications: ["Waterproofing Certification"],
    verification: "verified",
    address: "Pune, Maharashtra",
    rating: 4.6,
  },
  {
    email: "worker14@example.com",
    password: "Worker@12345",
    name: "Santosh Yadav",
    mobileNumber: "9000001014",
    skills: ["Construction", "Masonry"],
    experience: 11,
    certifications: ["Construction Safety"],
    verification: "verified",
    address: "Kolhapur, Maharashtra",
    rating: 4.8,
  },
  {
    email: "worker15@example.com",
    password: "Worker@12345",
    name: "Kiran Thorat",
    mobileNumber: "9000001015",
    skills: ["AC Repair", "Refrigerator Repair"],
    experience: 4,
    certifications: ["HVAC Certification"],
    verification: "verified",
    address: "Satara, Maharashtra",
    rating: 4.2,
  },
  {
    email: "worker16@example.com",
    password: "Worker@12345",
    name: "Deepak Patil",
    mobileNumber: "9000001016",
    skills: ["Welding", "Fabrication"],
    experience: 8,
    certifications: ["Welding Certification"],
    verification: "verified",
    address: "Sangli, Maharashtra",
    rating: 4.7,
  },
  {
    email: "worker17@example.com",
    password: "Worker@12345",
    name: "Ramesh Sawant",
    mobileNumber: "9000001017",
    skills: ["Gardening", "Tree Maintenance"],
    experience: 6,
    certifications: [],
    verification: "pending",
    address: "Pune, Maharashtra",
    rating: 4.0,
  },
  {
    email: "worker18@example.com",
    password: "Worker@12345",
    name: "Vishal Kamble",
    mobileNumber: "9000001018",
    skills: ["Tiling", "Flooring", "Masonry"],
    experience: 9,
    certifications: ["Tile Installation"],
    verification: "verified",
    address: "Kolhapur, Maharashtra",
    rating: 4.5,
  },
  {
    email: "worker19@example.com",
    password: "Worker@12345",
    name: "Manoj Dange",
    mobileNumber: "9000001019",
    skills: ["Plumbing", "Electrical"],
    experience: 7,
    certifications: ["ITI Plumbing"],
    verification: "verified",
    address: "Satara, Maharashtra",
    rating: 4.4,
  },
  {
    email: "worker20@example.com",
    password: "Worker@12345",
    name: "Suresh Gaikwad",
    mobileNumber: "9000001020",
    skills: ["Carpentry", "Furniture Repair", "Wood Polishing"],
    experience: 12,
    certifications: ["ITI Carpenter"],
    verification: "verified",
    address: "Pune, Maharashtra",
    rating: 4.9,
  },
];

const getRandomCooperativeId = () => {
  const randomIndex = Math.floor(Math.random() * COOPERATIVE_IDS.length);

  return new mongoose.Types.ObjectId(COOPERATIVE_IDS[randomIndex]);
};

const seed = async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);

    console.log("Connected to MongoDB");
    console.log("Database:", mongoose.connection.name);
    console.log("Host:", mongoose.connection.host);

    // Delete existing workers first
    const existingWorkers = await Worker.find({}).select("userId");

    const workerUserIds = existingWorkers.map((worker) => worker.userId);

    await Worker.deleteMany({});

    // Delete only the users belonging to workers
    if (workerUserIds.length > 0) {
      await User.deleteMany({
        _id: { $in: workerUserIds },
      });
    }

    console.log("Deleted existing workers and their users");

    // Seed workers
    for (const data of workers) {
      const user = await registerUser(
        data.email,
        data.password,
        data.name,
        data.mobileNumber,
        "worker"
      );

      const cooperativeId = getRandomCooperativeId();

      await Worker.create({
        userId: user._id,
        cooperativeId,
        skills: data.skills,
        experience: data.experience,
        certifications: data.certifications,
        verification: data.verification,
        address: data.address,
        rating: data.rating,
      });

      console.log(`Seeded: ${data.name} → Cooperative ${cooperativeId}`);
    }

    console.log(`\nSuccessfully seeded ${workers.length} workers.`);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

seed();
