#!/usr/bin/env node
/* ══════════════════════════════════════════════════════════════
   KiriTour — INDEXNOW
   Milaza avy hatrany amin'ny Bing (ary Yandex, Seznam, Naver…) fa misy
   pejy vaovao na niova. Ny Bing no ampiasain'ny ChatGPT Search sy Copilot,
   ka manampy ny site ho hitan'ireo IA ireo haingana kokoa.

   FAMPIASANA — AORIAN'NY DEPLOY ihany (rehefa efa an-tserasera ny site):
     node scripts/indexnow.mjs
══════════════════════════════════════════════════════════════ */
import fs from "fs";
import path from "path";

const HOST = "kiritourmadagascar.com";
const KEY = "83e38d8e61e7ab65f295171fcd984363";          // = public/<KEY>.txt
const KEY_URL = `https://${HOST}/${KEY}.txt`;

const sitemapFile = path.join(process.cwd(), "dist", "sitemap.xml");
if (!fs.existsSync(sitemapFile)) {
  console.error("❌ Tsy hita ny dist/sitemap.xml — ataovy aloha: npm run build");
  process.exit(1);
}
const urls = [...fs.readFileSync(sitemapFile, "utf8").matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);

/* Hamarino aloha fa an-tserasera ny key */
try {
  const r = await fetch(KEY_URL);
  const t = (await r.text()).trim();
  if (!r.ok || t !== KEY) throw new Error(`HTTP ${r.status}`);
} catch (e) {
  console.error(`❌ Tsy hita ao amin'ny site ny ${KEY_URL} (${e.message}).\n   Mi-deploy aloha, miandrasa minitra vitsivitsy, dia avereno.`);
  process.exit(1);
}

const res = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host: HOST, key: KEY, keyLocation: KEY_URL, urlList: urls }),
});
if (res.status === 200 || res.status === 202) console.log(`✅ IndexNow: pejy ${urls.length} nalefa tany amin'ny Bing sy ny namany.`);
else console.log(`⚠️  IndexNow namaly ${res.status}: ${await res.text()}`);
