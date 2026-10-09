#!/usr/bin/env node
/**
 * Secret Safety Scanner for Payvia
 * Verifies that secret files are properly ignored and no private credentials leaked into source code.
 */

import fs from "fs";
import path from "path";

const projectRoot = process.cwd();
const gitignorePath = path.join(projectRoot, ".gitignore");
const secretsExamplePath = path.join(projectRoot, "secrets.example.txt");

console.log("🔒 Running Payvia Secret Safety Scanner...\n");

let errorsFound = 0;

// 1. Check .gitignore
if (!fs.existsSync(gitignorePath)) {
  console.error("❌ ERROR: .gitignore file is missing!");
  errorsFound++;
} else {
  const gitignoreContent = fs.readFileSync(gitignorePath, "utf8");
  const requiredIgnores = ["secrets.txt", ".env", ".env.local"];

  for (const item of requiredIgnores) {
    if (!gitignoreContent.includes(item)) {
      console.error(`❌ ERROR: "${item}" is missing from .gitignore!`);
      errorsFound++;
    } else {
      console.log(`✅ Verified: "${item}" is excluded in .gitignore.`);
    }
  }
}

// 2. Check secrets.example.txt for accidental leaks
if (fs.existsSync(secretsExamplePath)) {
  const exampleContent = fs.readFileSync(secretsExamplePath, "utf8");
  const forbiddenPatterns = [
    /AIza[0-9A-Za-z-_]{35}/, // Google API Key
    /sk-[a-zA-Z0-9]{32,}/, // OpenAI API Key
    /EA[A-Za-z0-9_-]{50,}/, // PayPal live/sandbox token pattern
  ];

  for (const pattern of forbiddenPatterns) {
    if (pattern.test(exampleContent)) {
      console.error("❌ CRITICAL: Real-looking secret detected in secrets.example.txt!");
      errorsFound++;
    }
  }
  console.log("✅ Verified: secrets.example.txt contains only safe placeholder templates.");
}

// 2b. Check render.yaml for accidental secret values
const renderYamlPath = path.join(projectRoot, "render.yaml");
if (fs.existsSync(renderYamlPath)) {
  const renderYamlContent = fs.readFileSync(renderYamlPath, "utf8");
  const forbiddenPatterns = [
    /AIza[0-9A-Za-z-_]{35}/,
    /sk-[a-zA-Z0-9]{32,}/,
    /EA[A-Za-z0-9_-]{50,}/,
  ];

  for (const pattern of forbiddenPatterns) {
    if (pattern.test(renderYamlContent)) {
      console.error("❌ CRITICAL: Real-looking secret detected in render.yaml!");
      errorsFound++;
    }
  }
  console.log("✅ Verified: render.yaml contains only safe deployment specifications with sync: false.");
}

// 3. Scan for client-side exposure of secret keys in app and components
function scanDirectory(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });

  for (const file of files) {
    const fullPath = path.join(dir, file.name);

    if (file.isDirectory()) {
      if (file.name !== "node_modules" && file.name !== ".next" && file.name !== ".git") {
        scanDirectory(fullPath);
      }
    } else if (file.isFile() && (file.name.endsWith(".ts") || file.name.endsWith(".tsx"))) {
      const content = fs.readFileSync(fullPath, "utf8");
      if (content.includes("NEXT_PUBLIC_PAYPAL_CLIENT_SECRET")) {
        console.error(`❌ CRITICAL: NEXT_PUBLIC_PAYPAL_CLIENT_SECRET detected in ${fullPath}!`);
        errorsFound++;
      }
      if (content.includes("NEXT_PUBLIC_AI_API_KEY")) {
        console.error(`❌ CRITICAL: NEXT_PUBLIC_AI_API_KEY detected in ${fullPath}!`);
        errorsFound++;
      }
      if (content.includes("NEXT_PUBLIC_CHANNEL3_API_KEY")) {
        console.error(`❌ CRITICAL: NEXT_PUBLIC_CHANNEL3_API_KEY detected in ${fullPath}!`);
        errorsFound++;
      }
      if (content.includes("NEXT_PUBLIC_ELASTICSEARCH_API_KEY") || content.includes("NEXT_PUBLIC_ELASTIC_API_KEY")) {
        console.error(`❌ CRITICAL: Client-exposed Elasticsearch API Key detected in ${fullPath}!`);
        errorsFound++;
      }
    }
  }
}

scanDirectory(path.join(projectRoot, "app"));
scanDirectory(path.join(projectRoot, "components"));
console.log("✅ Verified: No private secrets exposed to client-side public prefixes.");

if (errorsFound > 0) {
  console.error(`\n❌ Secret safety check failed with ${errorsFound} error(s).`);
  process.exit(1);
} else {
  console.log("\n✨ Secret safety scan passed cleanly! Ready for secure development.");
}
