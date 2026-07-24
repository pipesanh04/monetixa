import type { NextConfig } from "next";
import { readFileSync } from "fs";
import { join } from "path";

const pkg = JSON.parse(
  readFileSync(join(/*turbopackIgnore: true*/ process.cwd(), "package.json"), "utf8"),
);

const nextConfig: NextConfig = {
  output: "standalone",
  env: {
    NEXT_PUBLIC_APP_VERSION: pkg.version,
  },
};

export default nextConfig;
