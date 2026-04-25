(function () {
  "use strict";

  /**
   * Format a Date as 12-hour time with seconds and AM/PM.
   * Example: "3:45:30 PM"
   * @param {Date} date
   * @returns {string}
   */
  function formatTime12Hour(date) {
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    const ampm = hours >= 12 ? "PM" : "AM";

    hours = hours % 12;
    hours = hours || 12; // 0 becomes 12

    const paddedMinutes = String(minutes).padStart(2, "0");
    const paddedSeconds = String(seconds).padStart(2, "0");

    return hours + ":" + paddedMinutes + ":" + paddedSeconds + " " + ampm;
  }

  /**
   * Update the clock display with the current time.
   */
  function updateClock() {
    var clockEl = document.querySelector(".hw-clock");
    if (clockEl) {
      clockEl.textContent = formatTime12Hour(new Date());
    }
  }

  // Update immediately, then every second
  updateClock();
  setInterval(updateClock, 1000);
})();
