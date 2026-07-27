const APP_URL = "http://localhost:3000";

document.getElementById("login").addEventListener("click", () => {
  chrome.tabs.create({ url: `${APP_URL}/extension-auth-callback` });
});

document.getElementById("refresh").addEventListener("click", loadQueue);

async function loadQueue() {
  const list = document.getElementById("list");
  list.textContent = "Loading…";
  try {
    const res = await fetch(`${APP_URL}/api/v1/extension?action=queue`, {
      credentials: "include",
    });
    const json = await res.json();
    if (!res.ok) {
      list.textContent = json.error?.message ?? "Not connected — open auth callback while logged in.";
      return;
    }
    list.innerHTML = "";
    for (const job of json.jobs ?? []) {
      const el = document.createElement("div");
      el.className = "item";
      el.innerHTML = `<div>${job.subreddit ?? ""}</div><div class="muted">${(job.content || "").slice(0, 140)}</div>`;
      const btn = document.createElement("button");
      btn.textContent = "Open thread";
      btn.onclick = () => {
        chrome.tabs.create({ url: job.permalink });
        chrome.storage.local.set({ citepathPendingDraft: job });
      };
      el.appendChild(btn);
      list.appendChild(el);
    }
    if (!(json.jobs ?? []).length) list.textContent = "Queue empty.";
  } catch (e) {
    list.textContent = String(e);
  }
}

loadQueue();
