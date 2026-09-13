import "dotenv/config";
import connectDB from "./db/db.js";
import { app } from "./app.js";

const PORT = process.env.PORT || 6969;

const start = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`INFO Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("ERROR Failed to start server:", err);
    process.exit(1);
  } 
};

start();
