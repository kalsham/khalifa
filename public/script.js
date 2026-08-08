(function () {
  "use strict";

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- build the timeline mock ---------- */

  var CLIP_WEIGHTS = [18, 26, 14, 22, 20];

  function buildClips() {
    var group = document.getElementById("clipGroup");
    if (!group) return;
    CLIP_WEIGHTS.forEach(function (w) {
      var clip = document.createElement("div");
      clip.className = "clip";
      clip.style.flexGrow = w;
      clip.style.flexBasis = "0";
      group.appendChild(clip);
    });
  }

  function buildMarkers() {
    var lane = document.getElementById("markerLane");
    if (!lane) return;

    var spacer = document.createElement("div");
    spacer.className = "marker-spacer";
    lane.appendChild(spacer);

    var track = document.createElement("div");
    track.className = "marker-track";
    lane.appendChild(track);

    var total = CLIP_WEIGHTS.reduce(function (a, b) { return a + b; }, 0);
    var cumulative = 0;

    CLIP_WEIGHTS.slice(0, -1).forEach(function (w, i) {
      cumulative += w;
      var marker = document.createElement("span");
      marker.className = "cut-marker";
      marker.textContent = "✂";
      marker.style.left = (cumulative / total) * 100 + "%";
      if (!reducedMotion) {
        marker.style.transitionDelay = 0.15 * (i + 1) + "s";
      }
      track.appendChild(marker);
    });
  }

  function buildWaveform() {
    var svg = document.getElementById("waveform");
    if (!svg) return;
    var bars = 48;
    var gap = 2;
    var barWidth = 400 / bars - gap;
    var seed = 7;

    function rand() {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    }

    for (var i = 0; i < bars; i++) {
      var h = 4 + rand() * 26;
      var rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      rect.setAttribute("x", i * (barWidth + gap));
      rect.setAttribute("y", (32 - h) / 2);
      rect.setAttribute("width", barWidth);
      rect.setAttribute("height", h);
      rect.setAttribute("rx", 1);
      svg.appendChild(rect);
    }
  }

  buildClips();
  buildMarkers();
  buildWaveform();

  /* ---------- reveal cut markers when the mock scrolls into view ---------- */

  var mock = document.getElementById("timelineMock");
  if (mock) {
    if (reducedMotion || !("IntersectionObserver" in window)) {
      mock.classList.add("in-view");
    } else {
      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              mock.classList.add("in-view");
              observer.disconnect();
            }
          });
        },
        { threshold: 0.4 }
      );
      observer.observe(mock);
    }
  }

  /* ---------- rotating timecode + status caption ---------- */

  var STATUSES = [
    { time: "00:00:14:02", status: "silence trimmed — 1.8s removed" },
    { time: "00:00:22:14", status: "jump cut smoothed" },
    { time: "00:00:41:07", status: "caption synced to dialogue" },
    { time: "00:01:03:19", status: "cut landed on the beat" }
  ];

  var timecodeEl = document.getElementById("timecode");
  var statusEl = document.getElementById("captionStatus");

  if (timecodeEl && statusEl && !reducedMotion) {
    var idx = 0;
    setInterval(function () {
      idx = (idx + 1) % STATUSES.length;
      timecodeEl.style.opacity = 0;
      statusEl.style.opacity = 0;
      setTimeout(function () {
        timecodeEl.textContent = STATUSES[idx].time;
        statusEl.textContent = STATUSES[idx].status;
        timecodeEl.style.opacity = 1;
        statusEl.style.opacity = 1;
      }, 300);
    }, 3600);
  }

  /* ---------- waitlist forms ---------- */

  var forms = document.querySelectorAll(".waitlist-form");
  var countEls = document.querySelectorAll('[data-role="count"]');

  function renderCount(count) {
    var label = count.toLocaleString() + (count === 1 ? " editor" : " editors") + " already on the list";
    countEls.forEach(function (el) {
      el.textContent = label;
    });
  }

  fetch("/api/waitlist/count")
    .then(function (res) { return res.json(); })
    .then(function (data) { renderCount(data.count); })
    .catch(function () {
      countEls.forEach(function (el) { el.textContent = ""; });
    });

  forms.forEach(function (form) {
    var input = form.querySelector(".email-input");
    var message = form.querySelector('[data-role="message"]');
    var button = form.querySelector(".btn");

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var email = input.value.trim();

      message.textContent = "";
      message.removeAttribute("data-state");
      button.disabled = true;

      fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email })
      })
        .then(function (res) {
          return res.json().then(function (data) {
            return { ok: res.ok, data: data };
          });
        })
        .then(function (result) {
          button.disabled = false;
          if (!result.ok) {
            message.textContent = result.data.error || "Something went wrong. Try again.";
            message.setAttribute("data-state", "error");
            return;
          }

          renderCount(result.data.count);
          input.value = "";
          input.disabled = true;
          button.textContent = "You're on the list";
          button.disabled = true;
          message.textContent = result.data.alreadyJoined
            ? "That email's already on the list."
            : "You're in — we'll email you when your seat opens.";
        })
        .catch(function () {
          button.disabled = false;
          message.textContent = "Couldn't reach the list right now. Try again in a moment.";
          message.setAttribute("data-state", "error");
        });
    });
  });
})();
