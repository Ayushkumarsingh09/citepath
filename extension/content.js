// Assists the user: if a pending draft exists for this thread, offer insert into composer.
// Does not bypass CAPTCHA, steal cookies, or auto-submit without user action.

async function maybeAssist() {
  const { citepathPendingDraft } = await chrome.storage.local.get("citepathPendingDraft");
  if (!citepathPendingDraft?.content) return;
  if (!location.href.includes(citepathPendingDraft.permalink?.split("?")[0] ?? "___none___")) return;

  const composers = [
    ...document.querySelectorAll('div[contenteditable="true"], textarea'),
  ];
  const target = composers.find((el) => el.offsetParent !== null);
  if (!target) return;

  const bar = document.createElement("div");
  bar.style.cssText =
    "position:fixed;bottom:16px;right:16px;z-index:999999;background:#171d25;color:#e8eef4;border:1px solid #2a3441;padding:12px;border-radius:12px;max-width:320px;font:13px/1.4 system-ui";
  bar.innerHTML = `<strong>CitePath</strong><div style="margin:8px 0;opacity:.8">Approved draft ready. Insert for your review — you submit.</div>`;
  const btn = document.createElement("button");
  btn.textContent = "Insert draft";
  btn.style.cssText =
    "background:#1a9b8e;border:0;color:white;padding:8px 12px;border-radius:8px;cursor:pointer;width:100%";
  btn.onclick = () => {
    if (target.tagName === "TEXTAREA") {
      target.value = citepathPendingDraft.content;
      target.dispatchEvent(new Event("input", { bubbles: true }));
    } else {
      target.focus();
      document.execCommand("insertText", false, citepathPendingDraft.content);
    }
    bar.remove();
  };
  bar.appendChild(btn);
  document.body.appendChild(bar);
}

maybeAssist();
