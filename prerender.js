/* ══════════════════════════════════════════════════════════════
   PRERENDER v3 — stable Puppeteer + retry + SEO rendering
══════════════════════════════════════════════════════════════ */

import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import puppeteer from "puppeteer";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(__dirname, "dist");
const PORT = 45679;

const routes = [
  "/",
  "/home",
  "/tours",
  "/about",
  "/contact",
  "/faq",
  "/blog",

  // BLOG
  "/blog/best-time-visit-avenue-baobabs-madagascar",
  "/blog/tsingy-de-bemaraha-travel-guide",
  "/blog/kirindy-forest-fossa-lemurs-guide",
  "/blog/tsiribihina-river-descent-complete-guide",
  "/blog/madagascar-itinerary-from-morondava",
  "/blog/what-to-pack-madagascar-safari",

  // TOURS
  "/tours/tsiribihina-river-3-day-pirogue-descent-madagascar",
  "/tours/tsiribihina-river-kirindy-forest-4-day-tour",
  "/tours/western-madagascar-5-day-circuit-baobabs-kirindy",
  "/tours/tsiribihina-tsingy-bemaraha-6-day-tour-madagascar",
  "/tours/menabe-grand-tour-8-day-madagascar-adventure",
  "/tours/andasibe-rainforest-indri-lemurs-3-day-tour",
  "/tours/andasibe-lemurs-mantadia-4-day-wildlife-tour",
  "/tours/andasibe-rainforest-5-day-immersion-madagascar",
  "/tours/andasibe-palmarium-aye-aye-5-day-madagascar",
  "/tours/tsingy-de-bemaraha-4-day-unesco-kirindy-baobabs",
  "/tours/tsingy-de-bemaraha-3-day-express-circuit-madagascar",
  "/tours/kirindy-forest-fossa-lemurs-2-day-safari",
  "/tours/kirindy-forest-1-day-tour-from-morondava",
  "/tours/avenue-baobabs-betania-kimony-day-tour-morondava",
];

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".txt": "text/plain",
  ".xml": "application/xml",
};

/* ══════════════════════════════════════════════════════════════
   LOCAL STATIC SERVER
══════════════════════════════════════════════════════════════ */

const server = http.createServer((req, res) => {
  try {
    const urlPath = decodeURIComponent(req.url.split("?")[0]);

    const filePath = path.join(DIST, urlPath);

    if (
      fs.existsSync(filePath) &&
      fs.statSync(filePath).isFile()
    ) {
      const ext = path.extname(filePath);

      res.writeHead(200, {
        "Content-Type":
          MIME[ext] || "application/octet-stream",
      });

      fs.createReadStream(filePath).pipe(res);
      return;
    }

    // SPA fallback
    res.writeHead(200, {
      "Content-Type": "text/html; charset=utf-8",
    });

    fs.createReadStream(
      path.join(DIST, "index.html")
    ).pipe(res);

  } catch (error) {
    console.error("Static server error:", error);

    res.writeHead(500, {
      "Content-Type": "text/plain; charset=utf-8",
    });

    res.end("Internal prerender server error");
  }
});

/* ══════════════════════════════════════════════════════════════
   WAIT
══════════════════════════════════════════════════════════════ */

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/* ══════════════════════════════════════════════════════════════
   CREATE PAGE
══════════════════════════════════════════════════════════════ */

async function createPage(browser) {
  const page = await browser.newPage();

  await page.setUserAgent(
    "Mozilla/5.0 (compatible; ReactSnap; +https://kiritourmadagascar.com)"
  );

  await page.setViewport({
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
  });

  /*
   * Marque explicitement le mode prerender.
   */
  await page.evaluateOnNewDocument(() => {
    window.__PRERENDER__ = true;
  });

  /*
   * Évite que certaines ressources externes ralentissent
   * inutilement le prerender.
   */
  await page.setCacheEnabled(true);

  return page;
}

/* ══════════════════════════════════════════════════════════════
   RENDER ONE ROUTE
══════════════════════════════════════════════════════════════ */

async function renderRoute(browser, route) {
  let page = null;

  try {
    page = await createPage(browser);

    const url = `http://localhost:${PORT}${route}`;

    console.log(`  → rendering ${route}`);

    await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });

    /*
     * Miandry React hiseho.
     */
    await page.waitForFunction(
      () => {
        const root = document.getElementById("root");

        return (
          root &&
          root.children &&
          root.children.length > 0
        );
      },
      {
        timeout: 30000,
      }
    );

    /*
     * Miandry kely mba hihazakazaka:
     * - SEO useEffect
     * - title
     * - canonical
     * - JSON-LD
     * - content
     */
    await sleep(1500);

    /*
     * Fanamarinana fototra.
     */
    const check = await page.evaluate(() => {
      const root = document.getElementById("root");

      return {
        title: document.title,
        canonical:
          document.querySelector(
            'link[rel="canonical"]'
          )?.href || "",
        rootChildren: root?.children?.length || 0,
        bodyTextLength:
          document.body?.innerText?.length || 0,
      };
    });

    if (!check.rootChildren) {
      throw new Error("React root is empty");
    }

    if (!check.bodyTextLength) {
      throw new Error("Rendered page has no body text");
    }

    console.log(
      `     ✓ title: ${check.title.slice(0, 70)}`
    );

    console.log(
      `     ✓ canonical: ${check.canonical}`
    );

    /*
     * Maka HTML final.
     */
    const html = await page.content();

    if (!html || html.length < 1000) {
      throw new Error(
        `Rendered HTML too small (${html?.length || 0} bytes)`
      );
    }

    return html;

  } finally {
    /*
     * Na inona na inona mitranga dia akatona tsara ny page.
     */
    if (page) {
      try {
        await page.close();
      } catch {
        // Page already closed — ignore
      }
    }
  }
}

/* ══════════════════════════════════════════════════════════════
   SAVE ROUTE
══════════════════════════════════════════════════════════════ */

function saveRoute(route, html) {
  const outDir =
    route === "/"
      ? DIST
      : path.join(DIST, route);

  fs.mkdirSync(outDir, {
    recursive: true,
  });

  const outputFile = path.join(
    outDir,
    "index.html"
  );

  fs.writeFileSync(
    outputFile,
    html,
    "utf8"
  );

  return outputFile;
}

/* ══════════════════════════════════════════════════════════════
   MAIN
══════════════════════════════════════════════════════════════ */

async function run() {
  let browser = null;

  try {
    await new Promise((resolve, reject) => {
      server.once("error", reject);

      server.listen(PORT, () => {
        console.log(
          `\n🌐 static server on http://localhost:${PORT}`
        );

        resolve();
      });
    });

    console.log("🚀 launching Puppeteer...\n");

    browser = await puppeteer.launch({
  headless: "new",
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",

  args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-web-security",
        "--disable-gpu",
        "--no-first-run",
        "--no-zygote",
        "--disable-background-networking",
        "--disable-background-timer-throttling",
        "--disable-renderer-backgrounding",
      ],
    });

    console.log("✅ Puppeteer launched\n");

    let ok = 0;
    const failed = [];

    for (const route of routes) {
      let success = false;

      /*
       * 3 attempts maximum.
       */
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          console.log(
            `\n[${ok + failed.length + 1}/${routes.length}] ${route}`
          );

          if (attempt > 1) {
            console.log(
              `  ↻ retry ${attempt}/3`
            );

            await sleep(2000);
          }

          const html = await renderRoute(
            browser,
            route
          );

          const outputFile = saveRoute(
            route,
            html
          );

          console.log(
            `  ✓ saved: ${outputFile}`
          );

          ok++;
          success = true;

          break;

        } catch (error) {
          const message =
            error?.message ||
            String(error);

          console.log(
            `  ⚠ attempt ${attempt}/3 failed: ${message.slice(
              0,
              160
            )}`
          );

          /*
           * Raha browser mihitsy no tapaka,
           * averina alefa.
           */
          if (
            message.includes(
              "Session closed"
            ) ||
            message.includes(
              "Connection closed"
            ) ||
            message.includes(
              "Target closed"
            ) ||
            message.includes(
              "Browser has disconnected"
            )
          ) {
            console.log(
              "  🔄 Browser session appears closed. Restarting..."
            );

            try {
              if (browser) {
                await browser.close();
              }
            } catch {
              // Ignore
            }

           browser = await puppeteer.launch({
  headless: "new",
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  args: [
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-dev-shm-usage",
                "--disable-web-security",
                "--disable-gpu",
                "--no-first-run",
                "--no-zygote",
                "--disable-background-networking",
                "--disable-background-timer-throttling",
                "--disable-renderer-backgrounding",
              ],
            });

            console.log(
              "  ✓ Browser restarted"
            );
          }
        }
      }

      if (!success) {
        failed.push(route);

        console.log(
          `  ✗ FINAL FAILURE: ${route}`
        );
      }
    }

    console.log("\n════════════════════════════════════");
    console.log(
      `✅ Prerendered ${ok}/${routes.length} pages`
    );

    if (failed.length > 0) {
      console.log(
        `⚠️ Failed (${failed.length}):`
      );

      for (const route of failed) {
        console.log(`   - ${route}`);
      }
    } else {
      console.log(
        "🎉 All routes prerendered successfully!"
      );
    }

    console.log(
      "════════════════════════════════════\n"
    );

    /*
     * Raha misy route tsy vita dia build failure.
     * Tsy avelantsika handeha any Vercel ny build
     * raha tsy feno ny prerender.
     */
    if (failed.length > 0) {
      process.exitCode = 1;
    }

  } catch (error) {
    console.error(
      "\n❌ PRERENDER ERROR:"
    );

    console.error(error);

    process.exitCode = 1;

  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch {
        // Ignore
      }
    }

    try {
      if (server.listening) {
        server.close();
      }
    } catch {
      // Ignore
    }
  }
}

run();