import mongoose from "mongoose";
import dotenv from "dotenv";

import { Service } from "../models/service.model.js";
import { DB_NAME } from "../constants.js";

dotenv.config();

const services = [
  {
    name: "Plumbing Repair",
    category: "Plumbing",
    description:
      "Professional repair of leaking pipes, taps, faucets, and other plumbing issues.",
    basePrice: 300,
  },
  {
    name: "Electrical Wiring",
    category: "Electrical",
    description:
      "Electrical wiring, switch installation, socket replacement, and basic electrical repairs.",
    basePrice: 500,
  },
  {
    name: "Furniture Repair",
    category: "Carpentry",
    description:
      "Repair and maintenance of wooden furniture including chairs, tables, doors, and cabinets.",
    basePrice: 400,
  },
  {
    name: "Wall Painting",
    category: "Painting",
    description:
      "Professional interior and exterior wall painting with surface preparation and finishing.",
    basePrice: 800,
  },
  {
    name: "Masonry Work",
    category: "Masonry",
    description:
      "Brickwork, cement work, wall repairs, and other general masonry services.",
    basePrice: 600,
  },
  {
    name: "AC Repair",
    category: "Appliance Repair",
    description:
      "Inspection, servicing, and repair of residential air conditioning systems.",
    basePrice: 500,
  },
  {
    name: "Welding Work",
    category: "Welding",
    description:
      "Metal welding and fabrication services for gates, grills, frames, and other structures.",
    basePrice: 700,
  },
  {
    name: "Garden Maintenance",
    category: "Gardening",
    description:
      "Routine garden maintenance including trimming, cleaning, pruning, and plant care.",
    basePrice: 400,
  },
  {
    name: "Floor Tiling",
    category: "Tiling",
    description:
      "Installation and replacement of floor and wall tiles with proper leveling and finishing.",
    basePrice: 1000,
  },
  {
    name: "Bathroom Fitting",
    category: "Plumbing",
    description:
      "Installation and replacement of bathroom fixtures including taps, showers, and fittings.",
    basePrice: 600,
  },
];

const seed = async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);

    console.log("Connected to MongoDB");
    console.log("Database:", mongoose.connection.name);
    console.log("Host:", mongoose.connection.host);

    // Delete existing services first
    await Service.deleteMany({});

    console.log("Deleted existing services");

    // Seed services
    await Service.insertMany(services);

    console.log(`Successfully seeded ${services.length} services.`);

    services.forEach((service) => {
      console.log(
        `Seeded: ${service.name} | ${service.category} | ₹${service.basePrice}`
      );
    });
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

seed();
