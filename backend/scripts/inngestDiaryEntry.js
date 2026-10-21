require("dotenv").config();

const connectDB = require("../config/db");
const DiaryEntry = require("../models/DiaryEntry");
const { embedText } = require("../services/rag/localAI");

async function main() {
  await connectDB();

  const entries = await DiaryEntry.find({
    $or: [
      { embedding: { $exists: false } },
      { embedding: { $size: 0 } },
    ],
  });

  let indexed = 0;

  for (const entry of entries) {
    try {
      const text = [
        `Title: ${entry.title}`,
        `Type: ${entry.mediaType}`,
        `Year: ${entry.year}`,
        `Rating: ${entry.rating ?? "Not rated"}`,
        `Review: ${entry.review || ""}`,
      ].join("\n");

      entry.embedding = await embedText(text);
      await entry.save();

      await DiaryEntry.updateOne(
        { _id: entry._id },
        { $set: { embedding } }
      );

      indexed++;
    } catch (error) {
      console.error(
        `Failed to embed ${entry.title}:`,
        error.message
      );
    }
  }

  console.log(`Indexed ${indexed} of ${entries.length} diary entries.`);
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});