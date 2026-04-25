import { Widget } from "@seelen-ui/lib";

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

// Update immediately, then every second
updateClock();
setInterval(updateClock, 1000);

// Initialize the Seelen widget
async function main() {
  const widget = Widget.getCurrent();

  await widget.init({
    autoSizeByContent: document.querySelector(".hw-root"),
    autoSizeFitOnScreen: true,
    normalizeDevicePixelRatio: true,
  });

  await widget.ready({ show: true });
}

main();
