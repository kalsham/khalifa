(() => {
  const pagesEl = document.getElementById("pages");
  const ribbonEl = document.getElementById("ribbon");
  const pages = Array.from(document.querySelectorAll(".page"));
  const numericSteps = pages
    .map((p) => Number(p.dataset.step))
    .filter((n) => !Number.isNaN(n));
  const totalSteps = numericSteps.length;

  const STORAGE_KEY = "kiosk-book-entries";
  const IDLE_MS = 120000;

  const state = {
    firstName: "",
    secondName: "",
    lastName: "",
    number: "",
    phraseImage: "",
    picture: "",
  };

  let entries = loadEntries();
  let browseIndex = 0;
  let currentStep = 1;
  let idleTimer = null;

  const phraseCanvas = document.getElementById("phraseCanvas");
  const phraseCtx = phraseCanvas.getContext("2d");
  let hasDrawn = false;
  let isDrawing = false;
  let lastPoint = null;

  function setupPhraseCanvas() {
    const rect = phraseCanvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    phraseCanvas.width = Math.max(1, Math.round(rect.width * dpr));
    phraseCanvas.height = Math.max(1, Math.round(rect.height * dpr));
    phraseCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    phraseCtx.strokeStyle = "#3b2a18";
    phraseCtx.lineWidth = 3;
    phraseCtx.lineCap = "round";
    phraseCtx.lineJoin = "round";
  }

  function canvasPoint(e) {
    const rect = phraseCanvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function trimmedPhraseDataUrl() {
    const w = phraseCanvas.width;
    const h = phraseCanvas.height;
    const pixels = phraseCtx.getImageData(0, 0, w, h).data;
    let minX = w;
    let minY = h;
    let maxX = -1;
    let maxY = -1;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (pixels[(y * w + x) * 4 + 3] > 10) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }
    if (maxX < minX || maxY < minY) {
      return phraseCanvas.toDataURL("image/webp", 0.92);
    }
    const pad = 10;
    minX = Math.max(0, minX - pad);
    minY = Math.max(0, minY - pad);
    maxX = Math.min(w - 1, maxX + pad);
    maxY = Math.min(h - 1, maxY + pad);
    const cropW = maxX - minX + 1;
    const cropH = maxY - minY + 1;
    const cropCanvas = document.createElement("canvas");
    cropCanvas.width = cropW;
    cropCanvas.height = cropH;
    cropCanvas.getContext("2d").drawImage(phraseCanvas, minX, minY, cropW, cropH, 0, 0, cropW, cropH);
    return cropCanvas.toDataURL("image/webp", 0.92);
  }

  function clearPhraseCanvas() {
    phraseCtx.save();
    phraseCtx.setTransform(1, 0, 0, 1, 0, 0);
    phraseCtx.clearRect(0, 0, phraseCanvas.width, phraseCanvas.height);
    phraseCtx.restore();
    hasDrawn = false;
  }

  phraseCanvas.addEventListener("pointerdown", (e) => {
    isDrawing = true;
    hasDrawn = true;
    lastPoint = canvasPoint(e);
    phraseCanvas.setPointerCapture(e.pointerId);
    showError("error-phrase", false);
  });
  phraseCanvas.addEventListener("pointermove", (e) => {
    if (!isDrawing) return;
    const p = canvasPoint(e);
    phraseCtx.beginPath();
    phraseCtx.moveTo(lastPoint.x, lastPoint.y);
    phraseCtx.lineTo(p.x, p.y);
    phraseCtx.stroke();
    lastPoint = p;
  });
  ["pointerup", "pointercancel", "pointerleave"].forEach((evt) => {
    phraseCanvas.addEventListener(evt, () => {
      isDrawing = false;
    });
  });

  setupPhraseCanvas();
  window.addEventListener("resize", setupPhraseCanvas);

  function loadEntries() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }

  function saveEntries() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch (e) {
      /* storage unavailable; the session's own view still works */
    }
  }

  function pageByStep(step) {
    return pages.find((p) => p.dataset.step === String(step));
  }

  function setRibbon(step) {
    if (typeof step !== "number") return;
    const progress = ((step - 1) / (totalSteps - 1)) * 100;
    ribbonEl.style.setProperty("--progress", progress);
  }

  function computeDir(current, next) {
    if (current === "browse" || next === "browse") return 1;
    return next > current ? 1 : -1;
  }

  function goToStep(nextStep) {
    if (nextStep === currentStep) return;
    const dir = computeDir(currentStep, nextStep);
    pagesEl.style.setProperty("--dir", dir);

    const currentEl = pageByStep(currentStep);
    const nextEl = pageByStep(nextStep);

    nextEl.classList.remove("exit");
    currentEl.classList.remove("active");
    currentEl.classList.add("exit");

    // force reflow so the browser registers the entering position first
    void nextEl.offsetWidth;

    requestAnimationFrame(() => {
      nextEl.classList.add("active");
    });

    window.setTimeout(() => {
      currentEl.classList.remove("exit");
    }, 680);

    currentStep = nextStep;
    setRibbon(typeof nextStep === "number" ? nextStep : null);

    if (nextStep === 5) renderResult();
    resetIdleTimer();
  }

  function showError(id, show) {
    const el = document.getElementById(id);
    if (el) el.hidden = !show;
  }

  function collectDetails() {
    state.firstName = document.getElementById("firstName").value.trim();
    state.secondName = document.getElementById("secondName").value.trim();
    state.lastName = document.getElementById("lastName").value.trim();
    state.number = document.getElementById("number").value.trim();
    return state.firstName && state.secondName && state.lastName && state.number;
  }

  function collectPhrase() {
    if (!hasDrawn) return false;
    state.phraseImage = trimmedPhraseDataUrl();
    return true;
  }

  function collectPicture() {
    return Boolean(state.picture);
  }

  const EASTERN_DIGITS = "٠١٢٣٤٥٦٧٨٩";
  function toEasternDigits(str) {
    return String(str).replace(/[0-9]/g, (d) => EASTERN_DIGITS[Number(d)]);
  }

  function resetGuestState() {
    document.getElementById("form-details").reset();
    clearPhraseCanvas();
    document.querySelectorAll(".plate-option").forEach((b) => b.setAttribute("aria-selected", "false"));
    document.getElementById("phraseByName").textContent = "اسمك الأول";
    state.firstName = state.secondName = state.lastName = state.number = state.phraseImage = state.picture = "";
  }

  function showToast(message, duration) {
    const el = document.getElementById("toast");
    el.textContent = message;
    el.hidden = false;
    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(() => {
      el.hidden = true;
    }, duration || 3500);
  }

  function renderBookStats() {
    const statsEl = document.getElementById("bookStats");
    const browseBtn = document.getElementById("browseOpenBtn");
    if (entries.length > 0) {
      statsEl.textContent = `يضمّ الكتاب حتى الآن ${toEasternDigits(entries.length)} صفحة.`;
      statsEl.hidden = false;
      browseBtn.hidden = false;
    } else {
      statsEl.hidden = true;
      browseBtn.hidden = true;
    }
  }

  function renderResult() {
    document.getElementById("resultFirstName").textContent = state.firstName;
    document.getElementById("resultPhraseImg").src = state.phraseImage;
    document.getElementById("resultFullName").textContent =
      `${state.firstName} ${state.secondName} ${state.lastName}`.replace(/\s+/g, " ").trim();
    document.getElementById("resultNumber").textContent = toEasternDigits(state.number);

    const source = document.querySelector(`.plate-option[data-picture="${state.picture}"] svg`);
    const artHost = document.getElementById("resultArt");
    artHost.innerHTML = "";
    if (source) {
      artHost.appendChild(source.cloneNode(true));
    }
  }

  function renderBrowsePage() {
    if (entries.length === 0) return;
    const entry = entries[browseIndex];
    document.getElementById("browseChapter").textContent = `الفصل رقم ${toEasternDigits(browseIndex + 1)}`;
    document.getElementById("browseFirstName").textContent = entry.firstName;
    document.getElementById("browsePhraseImg").src = entry.phraseImage;
    document.getElementById("browseFullName").textContent =
      `${entry.firstName} ${entry.secondName} ${entry.lastName}`.replace(/\s+/g, " ").trim();
    document.getElementById("browseCounter").textContent =
      `الصفحة ${toEasternDigits(browseIndex + 1)} من ${toEasternDigits(entries.length)}`;

    const source = document.querySelector(`.plate-option[data-picture="${entry.picture}"] svg`);
    const artHost = document.getElementById("browseArt");
    artHost.innerHTML = "";
    if (source) {
      artHost.appendChild(source.cloneNode(true));
    }

    const prevBtn = document.querySelector('[data-action="browse-prev"]');
    const nextBtn = document.querySelector('[data-action="browse-next"]');
    prevBtn.disabled = browseIndex === 0;
    nextBtn.disabled = browseIndex >= entries.length - 1;
  }

  function resetIdleTimer() {
    if (idleTimer) window.clearTimeout(idleTimer);
    if (currentStep === 1) return;
    idleTimer = window.setTimeout(() => {
      if (currentStep === "browse") {
        goToStep(1);
      } else {
        resetGuestState();
        goToStep(1);
      }
    }, IDLE_MS);
  }

  ["click", "keydown", "input", "touchstart"].forEach((evt) => {
    document.addEventListener(evt, resetIdleTimer, { passive: true });
  });

  document.getElementById("firstName").addEventListener("input", () => {
    const byName = document.getElementById("phraseByName");
    const val = document.getElementById("firstName").value.trim();
    byName.textContent = val || "اسمك الأول";
  });

  document.querySelectorAll(".plate-option").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".plate-option").forEach((b) => b.setAttribute("aria-selected", "false"));
      btn.setAttribute("aria-selected", "true");
      state.picture = btn.dataset.picture;
      showError("error-plate", false);
    });
  });

  document.body.addEventListener("click", (e) => {
    const target = e.target.closest("[data-action]");
    if (!target) return;
    const action = target.dataset.action;

    if (action === "start") {
      goToStep(2);
    } else if (action === "back") {
      goToStep(currentStep - 1);
    } else if (action === "next") {
      const from = Number(target.dataset.from);
      if (from === 2) {
        if (!collectDetails()) {
          showError("error-details", true);
          return;
        }
        showError("error-details", false);
        goToStep(3);
      } else if (from === 3) {
        if (!collectPhrase()) {
          showError("error-phrase", true);
          return;
        }
        showError("error-phrase", false);
        goToStep(4);
      } else if (from === 4) {
        if (!collectPicture()) {
          showError("error-plate", true);
          return;
        }
        goToStep(5);
      }
    } else if (action === "clear-phrase") {
      clearPhraseCanvas();
    } else if (action === "redo") {
      resetGuestState();
      goToStep(1);
    } else if (action === "commit") {
      const redoBtn = document.querySelector('.page[data-step="5"] [data-action="redo"]');
      target.disabled = true;
      if (redoBtn) redoBtn.disabled = true;

      entries.push({
        firstName: state.firstName,
        secondName: state.secondName,
        lastName: state.lastName,
        phraseImage: state.phraseImage,
        picture: state.picture,
      });
      saveEntries();
      renderBookStats();
      showToast(`أُضيفت صفحتك! هي الصفحة رقم ${toEasternDigits(entries.length)} في الكتاب.`);

      window.setTimeout(() => {
        target.disabled = false;
        if (redoBtn) redoBtn.disabled = false;
        resetGuestState();
        goToStep(1);
      }, 3500);
    } else if (action === "browse-open") {
      if (entries.length === 0) return;
      browseIndex = 0;
      renderBrowsePage();
      goToStep("browse");
    } else if (action === "browse-home") {
      goToStep(1);
    } else if (action === "browse-next") {
      if (browseIndex < entries.length - 1) {
        browseIndex += 1;
        renderBrowsePage();
      }
    } else if (action === "browse-prev") {
      if (browseIndex > 0) {
        browseIndex -= 1;
        renderBrowsePage();
      }
    }
  });

  setRibbon(1);
  renderBookStats();
})();
