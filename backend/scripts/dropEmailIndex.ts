import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";

// Load environment variables from the correct path (root of backend)
dotenv.config({ path: path.join(__dirname, "../.env") });

const MONGO_URI = process.env.MONGO_URI || "";

if (!MONGO_URI) {
  console.error("❌ MONGO_URI is missing in .env file");
  process.exit(1);
}

const dropIndex = async () => {
  try {
    console.log("⏳ Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    const collection = mongoose.connection.collection("users");
    const indexes = await collection.indexes();
    
    console.log("Existing Indexes:", indexes.map(idx => idx.name));

    const emailIndex = indexes.find(idx => idx.name === "email_1");

    if (emailIndex) {
      console.log("🗑️ Found 'email_1' index. Dropping it...");
      await collection.dropIndex("email_1");
      console.log("✅ Successfully dropped 'email_1' index.");
    } else {
      console.log("ℹ️ 'email_1' index was not found. Nothing to do.");
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
};

dropIndex();
