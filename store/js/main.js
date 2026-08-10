(() => {
  "use strict";

  const LANG_KEY = "rr_lang";
  let lang = localStorage.getItem(LANG_KEY) || "en";

  const strings = {
    en: {
      added: (name) => `Added ${name} to your bag`,
      bagEmptyToast: "Your bag is empty",
      checkoutNote: "Checkout isn't connected yet — wire up a UAE payment gateway to go live.",
      subscribed: (email) => `Saved ${email} — connect an email tool (Klaviyo/Mailchimp) to actually collect this.`,
    },
    ar: {
      added: (name) => `تمت إضافة ${name} إلى سلتك`,
      bagEmptyToast: "سلتك فارغة",
      checkoutNote: "الدفع غير مفعّل بعد — قم بربط بوابة دفع إماراتية لتفعيل الطلبات الحقيقية.",
      subscribed: (email) => `تم حفظ ${email} — قم بربط أداة بريد إلكتروني (Klaviyo/Mailchimp) لجمع هذا فعليًا.`,
    },
  };

  /* ---- language toggle ---- */
  const langToggle = document.getElementById("langToggle");

  function applyLang() {
    document.documentElement.lang = lang === "ar" ? "ar" : "en";
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.querySelectorAll("[data-en]").forEach((el) => {
      const text = lang === "ar" ? el.getAttribute("data-ar") : el.getAttribute("data-en");
      if (text !== null) el.textContent = text;
    });
    document.querySelectorAll("[data-name-en]").forEach((el) => {
      const key = lang === "ar" ? "data-name-ar" : "data-name-en";
      el.setAttribute("data-name", el.getAttribute(key));
    });
    localStorage.setItem(LANG_KEY, lang);
    renderBag();
  }

  langToggle.addEventListener("click", () => {
    lang = lang === "en" ? "ar" : "en";
    applyLang();
  });

  /* ---- mobile nav ---- */
  const navToggle = document.getElementById("navToggle");
  const navLinks = document.getElementById("navLinks");
  navToggle.addEventListener("click", () => {
    const open = navLinks.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(open));
  });
  navLinks.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => {
      navLinks.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    })
  );

  /* ---- roast line pins ---- */
  const pins = document.querySelectorAll(".pin");
  pins.forEach((pin) => {
    const show = () => {
      pins.forEach((p) => p.classList.remove("active"));
      pin.classList.add("active");
    };
    pin.addEventListener("mouseenter", show);
    pin.addEventListener("focus", show);
    pin.addEventListener("click", (e) => {
      e.preventDefault();
      show();
    });
  });

  /* ---- bag (client-side demo cart, persisted to localStorage) ---- */
  const STORAGE_KEY = "rr_bag";
  const bagToggle = document.getElementById("bagToggle");
  const bagDrawer = document.getElementById("bagDrawer");
  const bagOverlay = document.getElementById("bagOverlay");
  const bagClose = document.getElementById("bagClose");
  const bagItemsEl = document.getElementById("bagItems");
  const bagCountEl = document.getElementById("bagCount");
  const bagTotalEl = document.getElementById("bagTotal");
  const toast = document.getElementById("toast");

  function loadBag() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch {
      return {};
    }
  }
  function saveBag(bagData) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bagData));
  }

  let bag = loadBag();

  function money(n) {
    return (lang === "ar" ? `${n} د.إ` : `AED ${n}`);
  }

  function renderBag() {
    const entries = Object.values(bag);
    const count = entries.reduce((sum, item) => sum + item.qty, 0);
    bagCountEl.textContent = String(count);

    if (entries.length === 0) {
      const emptyText = lang === "ar"
        ? "سلتك فارغة. أضف كيس قهوة للبدء."
        : "Your bag is empty. Add a bag of beans to get started.";
      bagItemsEl.innerHTML = `<p class="bag-empty">${emptyText}</p>`;
      bagTotalEl.textContent = money(0);
      return;
    }

    const removeLabel = lang === "ar" ? "إزالة" : "Remove";
    bagItemsEl.innerHTML = "";
    let total = 0;
    entries.forEach((item) => {
      total += item.qty * item.price;
      const name = lang === "ar" ? item.nameAr : item.nameEn;
      const line = document.createElement("div");
      line.className = "bag-line";
      line.innerHTML = `
        <div>
          <div class="bag-line-name">${name}</div>
          <div class="bag-line-meta">${item.qty} &times; ${money(item.price)}</div>
        </div>
        <button class="bag-remove" data-remove="${item.key}">${removeLabel}</button>
      `;
      bagItemsEl.appendChild(line);
    });
    bagTotalEl.textContent = money(total);
  }

  function addToBag(key, nameEn, nameAr, price) {
    if (bag[key]) {
      bag[key].qty += 1;
    } else {
      bag[key] = { key, nameEn, nameAr, price, qty: 1 };
    }
    saveBag(bag);
    renderBag();
    showToast(strings[lang].added(lang === "ar" ? nameAr : nameEn));
  }

  function removeFromBag(key) {
    delete bag[key];
    saveBag(bag);
    renderBag();
  }

  bagItemsEl.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-remove]");
    if (!btn) return;
    removeFromBag(btn.getAttribute("data-remove"));
  });

  document.querySelectorAll("[data-add]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const card = btn.closest("[data-name-en]");
      const key = card.getAttribute("data-name-en");
      const nameEn = card.getAttribute("data-name-en");
      const nameAr = card.getAttribute("data-name-ar");
      const price = parseFloat(card.getAttribute("data-price"));
      addToBag(key, nameEn, nameAr, price);
    });
  });

  function openBag() {
    bagDrawer.classList.add("open");
    bagOverlay.classList.add("open");
    bagToggle.setAttribute("aria-expanded", "true");
  }
  function closeBag() {
    bagDrawer.classList.remove("open");
    bagOverlay.classList.remove("open");
    bagToggle.setAttribute("aria-expanded", "false");
  }
  bagToggle.addEventListener("click", () => {
    bagDrawer.classList.contains("open") ? closeBag() : openBag();
  });
  bagClose.addEventListener("click", closeBag);
  bagOverlay.addEventListener("click", closeBag);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeBag();
  });

  document.getElementById("checkoutBtn").addEventListener("click", () => {
    if (Object.keys(bag).length === 0) {
      showToast(strings[lang].bagEmptyToast);
      return;
    }
    showToast(strings[lang].checkoutNote);
  });

  /* ---- toast ---- */
  let toastTimer = null;
  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
  }

  /* ---- subscribe form (demo, no backend) ---- */
  const subscribeForm = document.getElementById("subscribeForm");
  const formNote = document.getElementById("formNote");
  const subscribeEmail = document.getElementById("subscribeEmail");
  subscribeForm.addEventListener("submit", (e) => {
    e.preventDefault();
    formNote.textContent = strings[lang].subscribed(subscribeEmail.value);
    subscribeEmail.value = "";
  });

  applyLang();
  renderBag();
})();
