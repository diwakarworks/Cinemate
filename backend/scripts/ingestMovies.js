require("dotenv").config();

const connectDB = require("../config/db");
const { ingestAllMovies } = require("../services/rag/inngest");

async function main() {
  await connectDB();

  const result = await ingestAllMovies();
  console.log("Ingestion complete:", result);

  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});