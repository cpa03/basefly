import { chromium } from "playwright";

async function checkConsole() {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  const errors = [];
  const warnings = [];

  page.on("console", (msg) => {
    const type = msg.type();
    const text = msg.text();
    if (type === "error") {
      errors.push(text);
    } else if (type === "warning") {
      warnings.push(text);
    }
  });

  page.on("pageerror", (error) => {
    errors.push(`Page error: ${error.message}`);
  });

  // Check homepage
  console.log("Checking http://localhost:3000/en...");
  await page.goto("http://localhost:3000/en", { waitUntil: "networkidle" });
  await page.waitForTimeout(3000);

  console.log("\n=== CONSOLE ERRORS ===");
  if (errors.length === 0) {
    console.log("✓ No console errors found!");
  } else {
    errors.forEach((e) => console.log(`✗ [ERROR] ${e}`));
  }

  console.log("\n=== CONSOLE WARNINGS ===");
  if (warnings.length === 0) {
    console.log("✓ No console warnings found!");
  } else {
    warnings.forEach((w) => console.log(`⚠ [WARNING] ${w}`));
  }

  await browser.close();
  process.exit(errors.length > 0 ? 1 : 0);
}

checkConsole().catch((err) => {
  console.error("Failed to check console:", err);
  process.exit(1);
});
