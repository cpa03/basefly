import * as chromeLauncher from "chrome-launcher";
import lighthouse from "lighthouse";
import { chromium } from "playwright";

async function runLighthouse() {
  console.log("Starting Lighthouse audit...\n");

  const chrome = await chromeLauncher.launch({
    chromeFlags: ["--headless", "--no-sandbox", "--disable-gpu"],
  });

  const options = {
    logLevel: "error",
    output: "json",
    onlyCategories: ["performance", "accessibility", "best-practices", "seo"],
    port: chrome.port,
  };

  const runnerResult = await lighthouse("http://localhost:3000/en", options);

  const lhr = runnerResult.lhr;

  console.log("=== LIGHTHOUSE SCORES ===");
  console.log(
    `Performance:     ${Math.round(lhr.categories.performance.score * 100)}`,
  );
  console.log(
    `Accessibility:   ${Math.round(lhr.categories.accessibility.score * 100)}`,
  );
  console.log(
    `Best Practices:  ${Math.round(lhr.categories["best-practices"].score * 100)}`,
  );
  console.log(`SEO:             ${Math.round(lhr.categories.seo.score * 100)}`);

  console.log("\n=== PERFORMANCE METRICS ===");
  const metrics = lhr.audits;
  console.log(
    `First Contentful Paint: ${metrics["first-contentful-paint"].displayValue}`,
  );
  console.log(
    `Largest Contentful Paint: ${metrics["largest-contentful-paint"].displayValue}`,
  );
  console.log(
    `Total Blocking Time: ${metrics["total-blocking-time"].displayValue}`,
  );
  console.log(
    `Cumulative Layout Shift: ${metrics["cumulative-layout-shift"].displayValue}`,
  );
  console.log(`Speed Index: ${metrics["speed-index"].displayValue}`);

  console.log("\n=== OPTIMIZATION OPPORTUNITIES ===");
  const opportunities = Object.values(lhr.audits).filter(
    (audit) =>
      audit.details &&
      audit.details.type === "opportunity" &&
      audit.numericValue > 0,
  );

  if (opportunities.length === 0) {
    console.log("✓ No significant optimization opportunities found!");
  } else {
    opportunities
      .sort((a, b) => b.numericValue - a.numericValue)
      .slice(0, 5)
      .forEach((opp) => {
        console.log(`⚠ ${opp.title}: ${opp.displayValue}`);
        if (opp.description) {
          console.log(`  ${opp.description.substring(0, 100)}...`);
        }
      });
  }

  console.log("\n=== ACCESSIBILITY ISSUES ===");
  const a11yIssues = Object.values(lhr.audits).filter(
    (audit) =>
      audit.category === "accessibility" &&
      audit.score !== null &&
      audit.score < 1,
  );

  if (a11yIssues.length === 0) {
    console.log("✓ No accessibility issues found!");
  } else {
    a11yIssues.slice(0, 5).forEach((issue) => {
      console.log(`⚠ ${issue.title}`);
    });
  }

  await chrome.kill();
}

runLighthouse().catch((err) => {
  console.error("Lighthouse failed:", err);
  process.exit(1);
});
