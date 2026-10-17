#!/usr/bin/env node
/* ══════════════════════════════════════════════════════════════
   KiriTour — CHECK SITE (alohan'ny deploy)
   Mijery ny dossier dist/ rehefa vita ny  npm run build :
     • pejy tsirairay: title, description, canonical, h1, JSON-LD, og:image
     • sary rehetra: misy tokoa ao amin'ny site, misy soratra (alt)
     • rohy anatiny rehetra: tsy misy mankany amin'ny pejy tsy misy (404)
     • sitemap.xml, robots.txt, llms.txt, favicon, CNAME, 404.html
   ❌ = tsy maintsy amboarina alohan'ny deploy
   ⚠️ = tsara amboarina fa tsy manakana ny deploy

   FAMPIASANA (ao amin'ny dossier "frontend"):
     npm run build
     node scripts/check-site.mjs
══════════════════════════════════════════════════════════════ */

import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const DIST = path.join(ROOT, "dist");
const SITE = "https://kiritourmadagascar.com";
const REMOTE_IMG = /https?:\/\/(i\.ibb\.co|res\.cloudinary\.com)\//i;

if (!fs.existsSync(DIST)) {
  console.error("❌ Tsy misy dossier dist/. Ataovy aloha:  npm run build");
  process.exit(1);
}

const errors = [];
const warns = [];
const err = (page, msg) => errors.push(`${page}  →  ${msg}`);
const warn = (page, msg) => warns.push(`${page}  →  ${msg}`);

/* ── helpers ── */
function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}
const decode = (s = "") => s.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
const attr = (tag, name) => {
  const m = tag.match(new RegExp(`\\s${name}\\s*=\\s*("([^"]*)"|'([^']*)')`, "i"));
  return m ? decode(m[2] ?? m[3] ?? "") : null;
};
const tags = (html, name) => html.match(new RegExp(`<${name}\\b[^>]*>`, "gi")) || [];
const metaContent = (html, key, val) => {
  const t = tags(html, "meta").find((m) => (attr(m, key) || "").toLowerCase() === val);
  return t ? attr(t, "content") : null;
};
const routeOf = (file) => {
  const rel = path.relative(DIST, path.dirname(file)).split(path.sep).join("/");
  return rel ? `/${rel}/` : "/";
};
/* Does a site path exist in dist? "/tours/x/" → dist/tours/x/index.html ; "/a.webp" → dist/a.webp */
function existsInDist(p) {
  let clean = decodeURIComponent(p.split("#")[0].split("?")[0]);
  if (!clean || clean === "/") return fs.existsSync(path.join(DIST, "index.html"));
  const f = path.join(DIST, clean);
  if (fs.existsSync(f) && fs.statSync(f).isFile()) return true;
  return fs.existsSync(path.join(DIST, clean.replace(/\/+$/, ""), "index.html"));
}
const toLocal = (u) => {
  if (!u) return null;
  if (u.startsWith(SITE)) return u.slice(SITE.length) || "/";
  if (u.startsWith("/") && !u.startsWith("//")) return u;
  return null;
};

/* ── 1. Pages ── */
const htmlFiles = walk(DIST).filter((f) => f.endsWith("index.html"));
const pages = [];
const redirects = [];
for (const f of htmlFiles) {
  const html = fs.readFileSync(f, "utf8");
  if (/http-equiv=["']refresh["']/i.test(html)) redirects.push(routeOf(f));
  else pages.push({ route: routeOf(f), html });
}

const titles = new Map();
const descs = new Map();
let imgTotal = 0, linkTotal = 0;

for (const { route, html } of pages) {
  /* title */
  const title = decode((html.match(/<title>([\s\S]*?)<\/title>/i) || [])[1] || "").trim();
  if (!title) err(route, "tsy misy <title>");
  else {
    if (title.length > 70) warn(route, `title lava loatra (${title.length} litera, tsara raha ≤ 65): "${title}"`);
    titles.set(title, [...(titles.get(title) || []), route]);
  }
  /* description */
  const desc = metaContent(html, "name", "description");
  if (!desc) err(route, "tsy misy meta description");
  else {
    if (desc.length < 70) warn(route, `description fohy loatra (${desc.length} litera)`);
    if (desc.length > 170) warn(route, `description lava loatra (${desc.length} litera, tsara raha ≤ 160)`);
    descs.set(desc, [...(descs.get(desc) || []), route]);
  }
  /* robots */
  const robots = metaContent(html, "name", "robots") || "";
  if (/noindex/i.test(robots)) err(route, "pejy misy noindex — tsy ho hitan'i Google");
  /* canonical */
  const canonTag = tags(html, "link").filter((l) => (attr(l, "rel") || "").toLowerCase() === "canonical");
  if (canonTag.length !== 1) err(route, `canonical: ${canonTag.length} no hita (tokony 1)`);
  else if (attr(canonTag[0], "href") !== SITE + route) err(route, `canonical diso: ${attr(canonTag[0], "href")} (tokony ${SITE + route})`);
  /* h1 */
  const h1 = (html.match(/<h1\b/gi) || []).length;
  if (h1 === 0) err(route, "tsy misy <h1>");
  if (h1 > 1) warn(route, `<h1> ${h1} (tsara raha 1 ihany)`);
  /* lang */
  if (!/<html[^>]*\slang=/i.test(html)) warn(route, "tsy misy lang ao amin'ny <html>");
  /* og:image */
  const og = metaContent(html, "property", "og:image");
  if (!og) warn(route, "tsy misy og:image (sary aseho amin'ny Facebook/WhatsApp)");
  else {
    const l = toLocal(og);
    if (l && !existsInDist(l)) err(route, `og:image tsy hita: ${og}`);
    if (REMOTE_IMG.test(og)) warn(route, `og:image mbola any ivelany: ${og}`);
  }
  /* JSON-LD */
  const lds = [...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  if (!lds.length) warn(route, "tsy misy JSON-LD (structured data)");
  for (const [, body] of lds) {
    try {
      const data = JSON.parse(body);
      const str = JSON.stringify(data);
      for (const m of str.matchAll(/"(?:image|contentUrl|thumbnailUrl|logo)":"([^"]+)"/g)) {
        const l = toLocal(m[1]);
        if (l && !existsInDist(l)) err(route, `JSON-LD misy sary tsy hita: ${m[1]}`);
      }
    } catch (e) {
      err(route, `JSON-LD diso (tsy JSON marina): ${e.message.slice(0, 80)}`);
    }
  }
  /* images */
  for (const t of tags(html, "img")) {
    const src = attr(t, "src");
    if (!src || src.startsWith("data:")) continue;
    imgTotal++;
    if (REMOTE_IMG.test(src)) warn(route, `sary mbola any ivelany (alefaso localize-images): ${src.slice(0, 90)}`);
    const l = toLocal(src);
    if (l && !existsInDist(l)) err(route, `sary tsy hita ao amin'ny site: ${src}`);
    const alt = attr(t, "alt");
    const hidden = (attr(t, "aria-hidden") || "") === "true";
    if (alt === null && !hidden) warn(route, `sary tsy misy alt: ${src.slice(0, 80)}`);
  }
  /* internal links */
  for (const t of tags(html, "a")) {
    const href = attr(t, "href");
    if (!href) continue;
    const l = toLocal(href);
    if (!l || l.startsWith("/#")) continue;
    linkTotal++;
    if (!existsInDist(l)) err(route, `rohy mankany amin'ny pejy tsy misy: ${href}`);
  }
}

for (const [t, rs] of titles) if (rs.length > 1) warn(rs.join(", "), `title mitovy: "${t.slice(0, 70)}"`);
for (const [d, rs] of descs) if (rs.length > 1) warn(rs.join(", "), `description mitovy: "${d.slice(0, 70)}…"`);

/* ── 2. Site files ── */
const need = (file, msg, isError = true) => {
  if (!fs.existsSync(path.join(DIST, file))) (isError ? err : warn)("/" + file, msg);
};
need("sitemap.xml", "tsy misy sitemap.xml");
need("robots.txt", "tsy misy robots.txt");
need("llms.txt", "tsy misy llms.txt (ho an'ny IA)", false);
need("404.html", "tsy misy 404.html (ilaina amin'ny GitHub Pages)");
need("CNAME", "tsy misy CNAME (domaine kiritourmadagascar.com)");
need("favicon.svg", "tsy misy favicon.svg");
need("favicon-192.png", "tsy misy favicon-192.png");
need("favicon-512.png", "tsy misy favicon-512.png (logo ho an'i Google)");

if (fs.existsSync(path.join(DIST, "CNAME"))) {
  const c = fs.readFileSync(path.join(DIST, "CNAME"), "utf8").trim();
  if (c !== "kiritourmadagascar.com" && c !== "www.kiritourmadagascar.com") err("/CNAME", `domaine hafa: "${c}"`);
}
if (fs.existsSync(path.join(DIST, "robots.txt"))) {
  const r = fs.readFileSync(path.join(DIST, "robots.txt"), "utf8");
  if (/^\s*Disallow:\s*\/\s*$/im.test(r)) err("/robots.txt", "misy 'Disallow: /' — manakana an'i Google tsy hahita ny site!");
  if (!/Sitemap:\s*https:\/\/kiritourmadagascar\.com\/sitemap\.xml/i.test(r)) warn("/robots.txt", "tsy misy andalana Sitemap");
}

/* ── 3. Sitemap ── */
let smUrls = 0, smImgs = 0;
if (fs.existsSync(path.join(DIST, "sitemap.xml"))) {
  const xml = fs.readFileSync(path.join(DIST, "sitemap.xml"), "utf8");
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => decode(m[1]));
  const imgs = [...xml.matchAll(/<image:loc>([^<]+)<\/image:loc>/g)].map((m) => decode(m[1]));
  smUrls = locs.length; smImgs = imgs.length;
  const pageSet = new Set(pages.map((p) => p.route));
  for (const u of locs) {
    const l = toLocal(u);
    if (!l) err("/sitemap.xml", `URL tsy an'ny site: ${u}`);
    else if (!pageSet.has(l)) err("/sitemap.xml", `URL ao amin'ny sitemap nefa tsy misy pejy: ${u}`);
  }
  for (const p of pageSet) if (!locs.includes(SITE + p) && p !== "/404/") warn(p, "pejy tsy ao amin'ny sitemap");
  for (const u of imgs) {
    const l = toLocal(u);
    if (l && !existsInDist(l)) err("/sitemap.xml", `sary tsy hita: ${u}`);
  }
  if (imgs.some((u) => REMOTE_IMG.test(u))) warn("/sitemap.xml", "misy sary mbola any ivelany (i.ibb.co / Cloudinary)");
}

/* ── 4. Report ── */
const show = (list, icon, max = 60) => {
  list.slice(0, max).forEach((l) => console.log(`  ${icon} ${l}`));
  if (list.length > max) console.log(`  … ary ${list.length - max} hafa`);
};
console.log("\n══════════════ KIRITOUR — CHECK SITE ══════════════");
console.log(`📄 Pejy: ${pages.length}   ↪ Redirect: ${redirects.length}   🖼 Sary: ${imgTotal}   🔗 Rohy anatiny: ${linkTotal}`);
console.log(`🗺  Sitemap: URL ${smUrls}, sary ${smImgs}`);
if (errors.length) { console.log(`\n❌ OLANA TSY MAINTSY AMBOARINA (${errors.length}):`); show(errors, "❌"); }
if (warns.length) { console.log(`\n⚠️  FANAMARIHANA (${warns.length}):`); show(warns, "⚠️ ", 40); }
console.log("\n═══════════════════════════════════════════════════");
if (errors.length) {
  console.log("⛔ TSY MBOLA AFAKA MI-DEPLOY — amboary aloha ireo ❌ ireo.\n");
  process.exitCode = 1;
} else {
  console.log("✅ VONONA HO DEPLOY — tsy misy olana manakana.\n");
}
