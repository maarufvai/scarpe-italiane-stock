import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

config({ path: ".env.local" });

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
  // Create bucket if it doesn't exist
  const { data: existing } = await supabase.storage.getBucket("product-images");

  if (existing) {
    console.log("Bucket 'product-images' already exists.");
    return;
  }

  const { error } = await supabase.storage.createBucket("product-images", {
    public: true,
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
    fileSizeLimit: 10 * 1024 * 1024, // 10 MB
  });

  if (error) {
    console.error("Failed:", error.message);
    process.exit(1);
  }

  console.log("Bucket 'product-images' created (public, 10 MB limit).");
}

main();
