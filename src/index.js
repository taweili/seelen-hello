/**
 * Format a Date as 12-hour time with seconds and AM/PM.
 * Example: "3:45:30 PM"
 */
function formatTime12Hour(date) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  return formatter.format(date);
}

/**
 * Update the clock display with the current time.
 */
function updateClock() {
  const clockEl = document.querySelector(".hw-clock");
  if (clockEl) {
    clockEl.textContent = formatTime12Hour(new Date());
  }
}

/**
 * Center the widget window on the primary monitor's work area
 * (excludes taskbar). Uses Tauri's window API available via
 * window.__TAURI__ in the Seelen UI webview.
 */
async function centerWindow() {
  try {
    const tauri = window.__TAURI__;
    if (!tauri?.window) return;

    const currentMonitor = await tauri.window.getCurrentMonitor();
    if (!currentMonitor?.workarea) return;

    const workarea = currentMonitor.workarea;
    const contentEl = document.querySelector(".hw-root");
    if (!contentEl) return;

    const rect = contentEl.getBoundingClientRect();
    const contentWidth = Math.ceil(rect.width);
    const contentHeight = Math.ceil(rect.height);

    const appWindow = await tauri.window.getCurrent();
    await appWindow.setPosition({
      x: Math.round(workarea.x + (workarea.width - contentWidth) / 2),
      y: Math.round(workarea.y + (workarea.height - contentHeight) / 2),
    });
  } catch {
    // Silently skip if Tauri API is unavailable (e.g. running outside Seelen UI)
  }
}

// Update immediately, then every second
updateClock();
setInterval(updateClock, 1000);

// Center on load — double rAF ensures the DOM has been painted
requestAnimationFrame(() => {
  requestAnimationFrame(centerWindow);
});
