/*
 * Fills the hero's intro from content/about.md, so the bio can be edited without touching the HTML.
 * Format:
 *   - Paragraphs are separated by a blank line.
 *   - Lines that start with a year range ("2019 - 2021", optionally followed by ":") become the career timeline.
 *     After the years, "Company - Role" or "Company | Role" is split at the first " - " or " | ".
 * If the file can't be loaded, the short intro already in the HTML stays.
 */
(function () {
  const target = document.getElementById("about");
  const career = document.getElementById("career");
  if (!target) return;
  const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  fetch("content/about.md", { cache: "no-cache" })
    .then((r) => (r.ok ? r.text() : Promise.reject(r.status)))
    .then((md) => {
      const blocks = md.replace(/\r/g, "").trim().split(/\n\s*\n/);
      const paras = [];
      const jobs = [];
      const YEARS = /^(\d{4})\s*[-–]\s*(\d{4}|present|now)\s*:?\s*(.*)$/i;
      for (const block of blocks) {
        const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
        if (lines.length && lines.every((l) => YEARS.test(l))) {
          for (const l of lines) {
            const [, from, to, rest] = l.match(YEARS);
            const m = rest.match(/^(.*?)\s+(?:[-–|])\s+(.*)$/);
            jobs.push({ years: `${from}–${to}`, org: (m ? m[1] : rest).replace(/\s{2,}/g, " ").trim(), role: m ? m[2].replace(/\s{2,}/g, " ").trim() : "" });
          }
        } else {
          paras.push(lines.join(" "));
        }
      }
      if (paras.length) target.innerHTML = paras.map((p) => `<p class="lede">${esc(p)}</p>`).join("");
      if (career && jobs.length) {
        career.innerHTML = jobs
          .map((j) => `<li><span class="years">${esc(j.years)}</span><span class="org">${esc(j.org)}</span>${j.role ? `<span class="role">${esc(j.role)}</span>` : ""}</li>`)
          .join("");
        career.closest("section").hidden = false;
      }
    })
    .catch(() => { /* keep the built-in intro */ });
})();
