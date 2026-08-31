(() => {
  const pagesEl = document.getElementById("pages");
  const ribbonEl = document.getElementById("ribbon");
  const pages = Array.from(document.querySelectorAll(".page"));
  const totalSteps = pages.length;

  const state = {
    firstName: "",
    secondName: "",
    lastName: "",
    number: "",
    phrase: "",
    picture: "",
  };

  let currentStep = 1;

  function pageByStep(step) {
    return pages.find((p) => Number(p.dataset.step) === step);
  }

  function setRibbon(step) {
    const progress = ((step - 1) / (totalSteps - 1)) * 100;
    ribbonEl.style.setProperty("--progress", progress);
  }

  function goToStep(nextStep) {
    if (nextStep === currentStep) return;
    const dir = nextStep > currentStep ? 1 : -1;
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
    setRibbon(nextStep);

    if (nextStep === 5) renderResult();
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
    state.phrase = document.getElementById("phrase").value.trim();
    return state.phrase.length > 0;
  }

  function collectPicture() {
    return Boolean(state.picture);
  }

  const EASTERN_DIGITS = "٠١٢٣٤٥٦٧٨٩";
  function toEasternDigits(str) {
    return str.replace(/[0-9]/g, (d) => EASTERN_DIGITS[Number(d)]);
  }

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
    } else if (action === "restart") {
      document.getElementById("form-details").reset();
      document.getElementById("phrase").value = "";
      document.querySelectorAll(".plate-option").forEach((b) => b.setAttribute("aria-selected", "false"));
      document.getElementById("phraseByName").textContent = "اسمك الأول";
      state.firstName = state.secondName = state.lastName = state.number = state.phrase = state.picture = "";
      goToStep(1);
    }
  });

  function renderResult() {
    document.getElementById("resultFirstName").textContent = state.firstName;
    document.getElementById("resultPhrase").textContent = state.phrase;
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

  setRibbon(1);
})();
