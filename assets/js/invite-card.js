// draws a personal invitation card (1080x1920) in the browser from the poster + page data.
// config comes from window.INVITE (set in graduation.html).
(() => {
  const C = window.INVITE;
  const W = 1080, H = 1920;
  const MONO = 'ui-monospace, "Cascadia Mono", "SF Mono", Menlo, Consolas, "Liberation Mono", monospace';
  const SANS = 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
  const INK = "#1d2a44", MUTED = "#5d6680", ACCENT = "#2546a8", NAVY = "#1f3a68", STAR = "#dba043";

  const loadPoster = () => new Promise((ok, fail) => {
    const img = new Image();
    img.onload = () => ok(img);
    img.onerror = fail;
    img.src = C.poster;
  });

  // paper rectangle, slightly rotated, with a soft shadow and a strip of tape
  function slip(ctx, x, y, w, h, angle, tape) {
    ctx.save();
    ctx.translate(x + w / 2, y + h / 2);
    ctx.rotate(angle * Math.PI / 180);
    ctx.shadowColor = "rgba(29,42,68,.22)"; ctx.shadowBlur = 24; ctx.shadowOffsetY = 8;
    ctx.fillStyle = "#fbf8f1";
    ctx.fillRect(-w / 2, -h / 2, w, h);
    ctx.shadowColor = "transparent";
    if (tape) {
      ctx.fillStyle = tape;
      ctx.rotate(-3 * Math.PI / 180);
      ctx.fillRect(-90, -h / 2 - 22, 180, 46);
    }
    ctx.restore();
  }

  // shrink the font until the text fits
  function fit(ctx, text, maxW, size, weight, family) {
    do { ctx.font = `${weight} ${size}px ${family}`; size -= 2; }
    while (ctx.measureText(text).width > maxW && size > 20);
  }

  async function draw(name) {
    const poster = await loadPoster();
    const cv = document.createElement("canvas");
    cv.width = W; cv.height = H;
    const ctx = cv.getContext("2d");
    ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";

    // paper background with a light grain
    ctx.fillStyle = "#e8e2d6"; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "rgba(0,0,0,.035)";
    for (let i = 0; i < 9000; i++) ctx.fillRect(Math.random() * W, Math.random() * H, 2, 2);

    // poster in the middle
    const pw = 590, ph = pw * poster.height / poster.width, py = 320;
    ctx.save();
    ctx.translate(W / 2, py + ph / 2); ctx.rotate(-1 * Math.PI / 180);
    ctx.shadowColor = "rgba(29,42,68,.3)"; ctx.shadowBlur = 40; ctx.shadowOffsetY = 14;
    ctx.drawImage(poster, -pw / 2, -ph / 2, pw, ph);
    ctx.restore();

    // top slip: dear <name>
    slip(ctx, 110, 60, 860, 230, -1.5, "rgba(219,160,67,.6)");
    ctx.save(); ctx.translate(W / 2, 175); ctx.rotate(-1.5 * Math.PI / 180);
    ctx.fillStyle = INK;
    fit(ctx, `dear ${name},`, 780, 78, 700, MONO);
    ctx.fillText(`dear ${name},`, 0, 0);
    // wavy underline under the name
    const full = ctx.measureText(`dear ${name},`).width;
    const pre = ctx.measureText("dear ").width, nm = ctx.measureText(name).width;
    const ux = -full / 2 + pre;
    ctx.strokeStyle = STAR; ctx.lineWidth = 5; ctx.beginPath();
    for (let x = 0; x <= nm; x += 4) ctx.lineTo(ux + x, 22 + Math.sin(x / 9) * 5);
    ctx.stroke();
    ctx.fillStyle = MUTED; ctx.font = `italic 400 40px ${SANS}`;
    ctx.fillText("you are warmly invited to celebrate", 0, 92);
    ctx.restore();

    // bottom slip: when + where
    const by = py + ph + 44, bh = H - by - 70;
    slip(ctx, 90, by, 900, bh, 1.2, "rgba(91,160,214,.5)");
    ctx.save(); ctx.translate(W / 2, by + 30); ctx.rotate(1.2 * Math.PI / 180);
    let y = 48;
    ctx.fillStyle = ACCENT; ctx.font = `700 26px ${SANS}`;
    ctx.fillText("W H E N", 0, y); y += 52;
    C.days.forEach((d, i) => {
      if (i) { ctx.fillStyle = MUTED; ctx.font = `italic 400 30px ${SANS}`; ctx.fillText("or", 0, y - 6); y += 40; }
      ctx.fillStyle = INK; fit(ctx, d, 820, 44, 700, SANS); ctx.fillText(d, 0, y); y += 48;
    });
    y += 18;
    ctx.fillStyle = ACCENT; ctx.font = `700 26px ${SANS}`;
    ctx.fillText("W H E R E", 0, y); y += 52;
    ctx.fillStyle = INK; fit(ctx, C.place, 820, 44, 700, SANS); ctx.fillText(C.place, 0, y); y += 42;
    ctx.fillStyle = MUTED; fit(ctx, C.address, 820, 30, 400, SANS); ctx.fillText(C.address, 0, y);
    ctx.restore();

    // tiny footer
    ctx.fillStyle = NAVY; ctx.globalAlpha = .55; ctx.font = `400 24px ${SANS}`;
    ctx.fillText(C.url, W / 2, H - 22); ctx.globalAlpha = 1;

    return cv;
  }

  // ---- ui ----
  const open = document.getElementById("card-open");
  const dlg = document.getElementById("card-dialog");
  const img = document.getElementById("card-img");
  const save = document.getElementById("card-save");
  const share = document.getElementById("card-share");
  let blob = null, fileName = "invitation.png";

  open.addEventListener("click", async () => {
    const name = (document.getElementById("greet-name").textContent || "").trim();
    if (!name) { document.getElementById("greet-input").focus(); return; }
    open.disabled = true; open.textContent = "drawing…";
    try {
      const cv = await draw(name);
      blob = await new Promise(r => cv.toBlob(r, "image/png"));
      fileName = `invitation-${name.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/gi, "d").replace(/[^\w]+/g, "-").toLowerCase()}.png`;
      if (img.src.startsWith("blob:")) URL.revokeObjectURL(img.src);
      img.src = URL.createObjectURL(blob);
      save.href = img.src; save.download = fileName;
      const file = new File([blob], fileName, { type: "image/png" });
      share.hidden = !(navigator.canShare && navigator.canShare({ files: [file] }));
      dlg.showModal();
    } catch (e) {
      alert("sorry, couldn't draw the card on this browser.");
    } finally {
      open.disabled = false; open.textContent = "🖼 get my invitation card";
    }
  });

  share.addEventListener("click", async () => {
    try { await navigator.share({ files: [new File([blob], fileName, { type: "image/png" })], title: C.title }); } catch (_) {}
  });
  document.getElementById("card-close").addEventListener("click", () => dlg.close());
  dlg.addEventListener("click", e => { if (e.target === dlg) dlg.close(); });
})();
