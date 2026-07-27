chrome.runtime.onInstalled.addListener(() => {
  console.log("CitePath extension installed");
});

// Polling hook — production should use alarms + daily random window
chrome.alarms?.create?.("citepath-poll", { periodInMinutes: 30 });
