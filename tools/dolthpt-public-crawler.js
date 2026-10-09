/*
 DOL THPT PUBLIC-PAGE CRAWLER — browser Console version
 Paste this file into DevTools Console while viewing dolthpt.vn.
 It does GET requests only, same-origin only, with credentials omitted.
 It excludes likely account/admin/API routes and never reads cookies, storage,
 password fields, request bodies, auth tokens or API response bodies.
 It only gathers public page text/headings/links and asset URL references.
 The JSON remains in your browser until you choose to download it.
*/
(async () => {
  const ORIGIN = location.origin;
  const MAX_PAGES = 80;
  const DELAY_MS = 350;
  const EXCLUDED = /\/(?:api|auth|login|log-in|signin|sign-in|register|sign-up|dang-nhap|dang-ky|logout|dashboard|account|profile|settings|admin|quan-ly-luyen-tap|history|practice-history|attempts|membership|billing|checkout|payment|user|users)(?:\/|$)/i;
  const BAD_EXT = /\.(?:pdf|zip|png|jpe?g|gif|webp|svg|mp4|mp3|woff2?|ttf|ico|css|js|map)(?:$|\?)/i;
  if (EXCLUDED.test(location.pathname)) {
    console.warn('[DOL public crawler] You appear to be on an account/API/admin page. Open a public landing page first; crawler stopped without collecting page data.');
    return;
  }
  const scrubText = value => String(value || '').replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[EMAIL]').replace(/\b(?:\+?84|0)(?:[ .()-]*\d){8,10}\b/g, '[PHONE]').replace(/\b[0-9a-f]{8}-[0-9a-f-]{27,}\b/gi, '[ID]').slice(0, 220);
  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
  const safeUrl = (value, base = ORIGIN) => {
    try {
      const u = new URL(value, base);
      if (u.origin !== ORIGIN || !['http:', 'https:'].includes(u.protocol)) return null;
      u.hash = '';
      // Keep path only; query strings may hold user identifiers or tracking tokens.
      u.search = '';
      if (EXCLUDED.test(u.pathname) || BAD_EXT.test(u.pathname)) return null;
      if (u.pathname.startsWith('/_next/') || u.pathname.startsWith('/cdn-cgi/')) return null;
      if (u.pathname.includes('..')) return null;
      return u;
    } catch { return null; }
  };
  const seen = new Set();
  const queue = [];
  const pages = [];
  const assets = new Set();
  const errors = [];
  const recordAsset = u => { if (u.origin === ORIGIN || /(?:^|\.)dolenglish\.vn$/i.test(u.hostname) || /(?:^|\.)vcdn\.cloud$/i.test(u.hostname)) assets.add(u.origin + u.pathname); };
  function enqueue(value, base) {
    const u = safeUrl(value, base);
    if (!u) return;
    const key = u.href.replace(/\/$/, '') || ORIGIN;
    if (!seen.has(key) && seen.size < MAX_PAGES * 12) { seen.add(key); queue.push(u.href); }
  }
  // Seeds: current public page, plus the same-origin robots.txt/sitemap tree.
  enqueue(location.href);
  const seedSitemap = async (sitemapUrl, depth = 0) => {
    if (depth > 2) return;
    try {
      const u = new URL(sitemapUrl, ORIGIN);
      if (u.origin !== ORIGIN) return;
      const r = await fetch(u.href, { credentials: 'omit', cache: 'no-store' });
      if (!r.ok) return;
      const xml = await r.text();
      const locs = [...xml.matchAll(/<loc>\s*([^<]+)\s*<\/loc>/gi)].map(m => m[1].trim());
      for (const loc of locs) {
        try {
          const target = new URL(loc, ORIGIN);
          if (target.origin !== ORIGIN) continue;
          if (/\.xml(?:$|\?)/i.test(target.pathname)) await seedSitemap(target.href, depth + 1);
          else enqueue(target.href);
        } catch {}
      }
    } catch {}
  };
  try {
    const robots = await fetch(ORIGIN + '/robots.txt', { credentials: 'omit', cache: 'no-store' });
    if (robots.ok) {
      const txt = await robots.text();
      for (const line of txt.split(/\r?\n/)) {
        const m = line.match(/^\s*Sitemap:\s*(\S+)/i);
        if (m) await seedSitemap(m[1]);
      }
    }
  } catch {}
  await seedSitemap(ORIGIN + '/sitemap.xml');
  const currentStyle = (() => {
    try {
      const s = getComputedStyle(document.documentElement);
      const b = getComputedStyle(document.body);
      const vars = {};
      for (let i = 0; i < s.length; i++) {
        const k = s[i]; if (k.startsWith('--')) vars[k] = s.getPropertyValue(k).trim().slice(0, 120);
      }
      return { rootVariables: vars, body: { backgroundColor: b.backgroundColor, color: b.color, fontFamily: b.fontFamily, fontSize: b.fontSize } };
    } catch { return {}; }
  })();
  console.log('[DOL public crawler] Starting. Same origin only; auth/API/private paths are excluded.');
  while (queue.length && pages.length < MAX_PAGES) {
    const url = queue.shift();
    try {
      const response = await fetch(url, { method: 'GET', credentials: 'omit', cache: 'no-store', redirect: 'follow' });
      if (!response.ok) { errors.push({ path: new URL(url).pathname, status: response.status }); continue; }
      const type = response.headers.get('content-type') || '';
      if (!type.includes('text/html')) continue;
      const html = await response.text();
      // Do not persist raw HTML/serialized Next data: only derive public visual/content metadata.
      const doc = new DOMParser().parseFromString(html, 'text/html');
      doc.querySelectorAll('script,style,noscript,template,svg,iframe,form,input,textarea,select,option,button[type="submit"]').forEach(el => el.remove());
      const path = new URL(url).pathname;
      const text = scrubText((doc.body?.innerText || doc.body?.textContent || '').replace(/\s+/g, ' ').trim()).slice(0, 10000);
      const links = [...doc.querySelectorAll('a[href]')].map(a => ({ text: (a.innerText || a.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 160), href: a.getAttribute('href') })).filter(a => a.text && a.href);
      const cleanLinks = [];
      for (const link of links) { const u = safeUrl(link.href, url); if (u) { cleanLinks.push({ text: link.text, path: u.pathname }); enqueue(u.href); } }
      const domOutline = [...doc.querySelectorAll('main,header,nav,footer,section,article,aside,h1,h2,h3,h4,p,a,button,img,ul,ol,li,table,thead,tbody,tr,th,td,figure,dialog,details,summary,div,span')].slice(0, 420).map(el => ({
        tag: el.tagName.toLowerCase(),
        id: (el.id || '').slice(0, 100),
        classes: (typeof el.className === 'string' ? el.className : '').trim().split(/\s+/).filter(Boolean).slice(0, 12).join(' ').slice(0, 240),
        role: (el.getAttribute('role') || '').slice(0, 80),
        ariaLabel: (el.getAttribute('aria-label') || '').slice(0, 160),
        text: (['H1','H2','H3','H4','P','A','BUTTON','TH','TD','SUMMARY'].includes(el.tagName) ? scrubText((el.innerText || el.textContent || '').replace(/\s+/g, ' ').trim()) : ''),
        childCount: el.children?.length || 0
      })).filter(n => n.id || n.classes || n.role || n.ariaLabel || n.text || ['main','header','nav','footer','section','article','aside'].includes(n.tag));
      const images = [...doc.querySelectorAll('img[src], source[srcset]')].slice(0, 80).map(el => {
        const raw = el.getAttribute('src') || (el.getAttribute('srcset') || '').split(',')[0].trim().split(' ')[0];
        try { const u = new URL(raw, url); if (['http:','https:'].includes(u.protocol)) { recordAsset(u); return { path: u.origin === ORIGIN ? u.pathname : ((/(?:^|\.)dolenglish\.vn$/i.test(u.hostname)||/(?:^|\.)vcdn\.cloud$/i.test(u.hostname)) ? (u.origin + u.pathname) : '[third-party asset omitted]'), alt: scrubText(el.getAttribute('alt') || '').slice(0,160) }; } } catch {}
        return null;
      }).filter(Boolean);
      const css = [...doc.querySelectorAll('link[rel="stylesheet"][href]')].map(el => { try { const u = new URL(el.href || el.getAttribute('href'), url); if(u.protocol==='https:'||u.protocol==='http:'){recordAsset(u);return u.origin===ORIGIN?u.pathname:'[external stylesheet]';} } catch {} return null; }).filter(Boolean);
      const js = [...new Set([...html.matchAll(/<script[^>]+src=["']([^"']+)["']/gi)].map(m=>m[1]))].slice(0,80).map(src=>{try{const u=new URL(src,url);if(u.protocol==='http:'||u.protocol==='https:'){recordAsset(u);return u.origin===ORIGIN?u.pathname:'[external script]';}}catch{}return null;}).filter(Boolean);
      pages.push({ path, status: response.status, title: (doc.title || '').trim().slice(0,200), description: (doc.querySelector('meta[name="description"]')?.content || '').slice(0,500), canonical: (()=>{try{const c=doc.querySelector('link[rel="canonical"]')?.href;const u=c&&new URL(c);return u&&u.origin===ORIGIN?u.pathname:null}catch{return null}})(), headings: [...doc.querySelectorAll('h1,h2,h3')].slice(0,60).map(h=>({level:h.tagName.toLowerCase(),text:(h.innerText||h.textContent||'').replace(/\s+/g,' ').trim().slice(0,220)})).filter(h=>h.text), visibleText: text, links: cleanLinks.slice(0,250), domOutline, images, stylesheets: css, scripts: js });
      console.log(`[DOL public crawler] ${pages.length}/${MAX_PAGES} ${path}`);
    } catch (e) { errors.push({ path: (()=>{try{return new URL(url).pathname}catch{return '[invalid]'}})(), error: String(e?.message||'request failed').slice(0,160) }); }
    await sleep(DELAY_MS);
  }
  // Inspect a bounded set of same-origin stylesheet rules as design tokens only; never store raw CSS.
  const cssAudit = { filesScanned: 0, colors: [], customProperties: [], fontFamilies: [], fontSizes: [], mediaQueries: [] };
  const colorSet = new Set(), variableSet = new Set(), familySet = new Set(), sizeSet = new Set(), mediaSet = new Set();
  const cssPaths = [...new Set(pages.flatMap(page => page.stylesheets.filter(x => x.startsWith('/'))))].slice(0, 40);
  for (const cssPath of cssPaths) {
    try {
      const r = await fetch(ORIGIN + cssPath, { credentials: 'omit', cache: 'no-store' });
      if (!r.ok || !(r.headers.get('content-type') || '').includes('css')) continue;
      const css = (await r.text()).slice(0, 1_500_000);
      cssAudit.filesScanned++;
      for (const m of css.matchAll(/#[0-9a-f]{3,8}\b|rgba?\([^)]{1,80}\)|hsla?\([^)]{1,80}\)/gi)) colorSet.add(m[0].slice(0,100));
      for (const m of css.matchAll(/(--[\w-]+)\s*:\s*([^;}{]{1,100})/g)) variableSet.add(`${m[1]}: ${m[2].trim()}`);
      for (const m of css.matchAll(/font-family\s*:\s*([^;}{]{1,140})/gi)) familySet.add(m[1].trim());
      for (const m of css.matchAll(/font-size\s*:\s*([^;}{]{1,60})/gi)) sizeSet.add(m[1].trim());
      for (const m of css.matchAll(/@media\s*[^{}]{1,140}/gi)) mediaSet.add(m[0].trim());
    } catch {}
  }
  cssAudit.colors = [...colorSet].slice(0, 180);
  cssAudit.customProperties = [...variableSet].slice(0, 250);
  cssAudit.fontFamilies = [...familySet].slice(0, 100);
  cssAudit.fontSizes = [...sizeSet].slice(0, 100);
  cssAudit.mediaQueries = [...mediaSet].slice(0, 100);
  const liveElements = [...document.querySelectorAll('header,nav,main,section,article,aside,footer,h1,h2,h3,p,a,button,img')].slice(0, 250).map(el => {
    const rect = el.getBoundingClientRect(); const cs = getComputedStyle(el);
    return { tag: el.tagName.toLowerCase(), classes: (typeof el.className==='string'?el.className:'').trim().split(/\s+/).filter(Boolean).slice(0,12).join(' ').slice(0,200), text: (['H1','H2','H3','P','A','BUTTON'].includes(el.tagName)?scrubText((el.innerText||el.textContent||'').replace(/\s+/g,' ').trim()).slice(0,140):''), x: Math.round(rect.x), y: Math.round(rect.y), width: Math.round(rect.width), height: Math.round(rect.height), font: cs.fontFamily, fontSize: cs.fontSize, color: cs.color, background: cs.backgroundColor, borderRadius: cs.borderRadius };
  });
  const report = {
    reportType: 'dolthpt-public-frontend-inventory',
    generatedAt: new Date().toISOString(),
    origin: ORIGIN,
    notes: [
      'Only same-origin GET requests were made; credentials were omitted.',
      'No cookie values, local/session storage, passwords, request bodies, authentication tokens, raw HTML or API response bodies were collected.',
      'This is public frontend metadata, not source code, backend code or a database backup.',
      'Some client-rendered or authenticated pages may not be represented; no login bypass was attempted.'
    ],
    currentPageStyle: currentStyle,
    liveDomSnapshot: liveElements,
    cssDesignAudit: cssAudit,
    counts: { pages: pages.length, assets: assets.size, errors: errors.length, queuedButNotVisited: queue.length },
    pages,
    publicAssetReferences: [...assets].slice(0, 3000),
    errors
  };
  const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'dolthpt-public-crawl.json';
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 3000);
  console.log('[DOL public crawler] Done:', report.counts, 'Downloaded dolthpt-public-crawl.json');
})();
