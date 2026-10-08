(() => {
  // TDH Mission Deep Collector
  // Run on https://thayduonghoa.com/luyen-nhiem-vu BEFORE clicking Start.
  // It intentionally does NOT read cookies, localStorage/sessionStorage values, or auth headers.

  const startedAt = new Date().toISOString();
  const net = [];
  const snapshots = [];

  const secretKey = /pass(word)?|secret|token|authorization|cookie|set-cookie|api[_-]?key|private[_-]?key|phone|email/i;

  function redact(value, depth = 0) {
    if (depth > 6) return "[depth-limit]";
    if (typeof value === "string") {
      return value
        .replace(/Bearer\s+[A-Za-z0-9._~+/=-]+/gi, "Bearer [REDACTED]")
        .replace(/AIza[0-9A-Za-z_-]{20,}/g, "[REDACTED_KEY]");
    }
    if (Array.isArray(value)) return value.slice(0, 100).map(v => redact(v, depth + 1));
    if (value && typeof value === "object") {
      const out = {};
      for (const [k,v] of Object.entries(value)) {
        out[k] = secretKey.test(k) ? "[REDACTED]" : redact(v, depth + 1);
      }
      return out;
    }
    return value;
  }

  function clip(s, n = 50000) {
    s = String(s ?? "");
    return s.length > n ? s.slice(0, n) + "\n...[CLIPPED]..." : s;
  }

  function bodyToSafe(raw) {
    if (!raw) return null;
    if (typeof raw === "string") {
      try { return redact(JSON.parse(raw)); } catch { return clip(raw, 12000); }
    }
    if (raw instanceof FormData) {
      const obj = {};
      for (const [k,v] of raw.entries()) obj[k] = secretKey.test(k) ? "[REDACTED]" : String(v).slice(0, 2000);
      return obj;
    }
    if (raw instanceof URLSearchParams) return Object.fromEntries(raw.entries());
    if (raw instanceof Blob) return `[Blob ${raw.type || "unknown"} ${raw.size} bytes]`;
    try { return redact(raw); } catch { return String(raw); }
  }

  function domSnapshot(label) {
    const pageEl = document.querySelector("#app") || document.body;
    const dataPage = document.querySelector("#app")?.getAttribute("data-page") || "";
    let inertia = null;
    try { inertia = dataPage ? redact(JSON.parse(dataPage)) : null; } catch {}
    const rootStyles = getComputedStyle(document.documentElement);
    const vars = {};
    for (const name of Array.from(rootStyles)) {
      if (String(name).startsWith("--")) vars[name] = rootStyles.getPropertyValue(name).trim();
    }
    const buttons = [...document.querySelectorAll("button")].slice(0, 150).map((b,i)=>({
      i,text:(b.innerText||b.getAttribute("aria-label")||"").trim().slice(0,500),
      aria:b.getAttribute("aria-label"),title:b.getAttribute("title"),
      disabled:b.disabled,cls:b.className
    }));
    const links = [...document.querySelectorAll("a")].slice(0, 150).map((a,i)=>({
      i,text:(a.innerText||"").trim().slice(0,300),href:a.href,cls:a.className
    }));
    const inputs = [...document.querySelectorAll("input,textarea,select")].slice(0,150).map((x,i)=>({
      i,tag:x.tagName,type:x.type||"",name:x.name||"",placeholder:x.placeholder||"",value:x.tagName==="SELECT"?"":(x.value||"").slice(0,500),cls:x.className
    }));
    snapshots.push({
      label,at:new Date().toISOString(),
      url:location.href,title:document.title,
      visibleText:clip(document.body.innerText,60000),
      html:clip(pageEl.outerHTML,120000),
      inertia,
      cssVariables:vars,buttons,links,inputs,
      resources:performance.getEntriesByType("resource").map(x=>x.name).filter(n=>/build\/assets|luyen-nhiem-vu|nhiem-vu|activity|notifications|support/i.test(n)).slice(-300)
    });
  }

  const originalFetch = window.fetch;
  window.fetch = async (...args) => {
    const input = args[0], init = args[1] || {};
    const url = typeof input === "string" ? input : input?.url;
    const method = init.method || (typeof input !== "string" && input?.method) || "GET";
    const reqBody = bodyToSafe(init.body || (typeof input !== "string" ? input?.body : null));
    const t0 = performance.now();
    const response = await originalFetch(...args);
    const entry = { kind:"fetch", method, url, status:response.status, requestBody:reqBody, durationMs:Math.round(performance.now()-t0) };
    try {
      const type = response.headers.get("content-type") || "";
      if (/json|javascript|text/i.test(type)) {
        const clone = response.clone();
        const txt = await clone.text();
        entry.responseBody = clip(bodyToSafe(txt), 80000);
      }
    } catch (e) { entry.responseReadError = String(e); }
    net.push(entry);
    return response;
  };

  const XO = XMLHttpRequest.prototype.open;
  const XS = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.open = function(method,url,...rest) {
    this.__tdh = {method,url};
    return XO.call(this,method,url,...rest);
  };
  XMLHttpRequest.prototype.send = function(body) {
    const meta=this.__tdh||{};
    const t0=performance.now();
    const reqBody=bodyToSafe(body);
    this.addEventListener("loadend",()=>{
      net.push({
        kind:"xhr",method:meta.method,url:meta.url,status:this.status,
        requestBody:reqBody,durationMs:Math.round(performance.now()-t0),
        responseBody:clip(bodyToSafe(this.responseText),80000)
      });
    });
    return XS.call(this,body);
  };

  window.__TDH_MISSION_COLLECTOR__ = { startedAt, net, snapshots, domSnapshot };

  domSnapshot("collector-start");
  console.log("✅ TDH Mission Collector đang chạy.");
  console.log("Bây giờ thao tác website gốc bình thường: chọn chapter → chọn mức → Start → làm vài câu → Submit.");
  console.log("Sau cùng chạy: copy(window.__TDH_MISSION_REPORT__())");

  window.__TDH_MISSION_REPORT__ = () => JSON.stringify({
    meta:{collector:"tdh-mission-deep-collector",startedAt,finishedAt:new Date().toISOString(),url:location.href},
    snapshots,network:net,
    final:{url:location.href,title:document.title,pathname:location.pathname}
  }, null, 2);

  window.__TDH_MISSION_SNAPSHOT__ = (label="manual") => {
    domSnapshot(label);
    console.log("Snapshot added:",label);
  };
})();
