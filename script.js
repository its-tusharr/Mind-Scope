/* ===== MindScope – frontend logic ===== */
(() => {
  "use strict";

  // Change this if your backend runs elsewhere.
  const API_BASE_URL = "https://mind-scope-1.onrender.com";
  const PREDICT_URL = `${API_BASE_URL}/predict`;

  // Countries the backend groups explicitly (everything else becomes "Other" server-side),
  // followed by extra suggestions. Users may type any country.
  const BACKEND_COUNTRIES = ["India", "USA", "Canada", "Australia", "UK", "Germany", "Mexico", "Turkey", "France"];
  const EXTRA_COUNTRIES = ["Brazil", "China", "Japan", "South Korea", "Russia", "Italy", "Spain", "Netherlands",
    "Sweden", "Norway", "Denmark", "Ireland", "Switzerland", "Singapore", "Pakistan", "Bangladesh", "Nepal",
    "Sri Lanka", "Indonesia", "Philippines", "Vietnam", "Thailand", "Malaysia", "South Africa", "Nigeria",
    "Kenya", "Egypt", "Saudi Arabia", "UAE", "Argentina", "Chile", "Colombia", "Poland", "Portugal", "New Zealand", "Other"];

  // Gauge scale = lowest and highest Mental_Health_Score seen in the training notebook (3.6 – 9.4).
  // The red / yellow / green bands are simply equal thirds of this range (a visual guide, NOT a clinical scale).
  const GAUGE_MIN = 3.6;
  const GAUGE_MAX = 9.4;

  // Field definitions: drives validation and the request payload (keys = API field names).
  const FIELDS = [
    { name: "age", label: "Age", type: "int", min: 10, max: 120 },
    { name: "gender", label: "Gender", type: "select" },
    { name: "country", label: "Country", type: "text" },
    { name: "academic_level", label: "Academic level", type: "select" },
    { name: "most_used_platform", label: "Most used platform", type: "select" },
    { name: "purpose_of_use", label: "Purpose of use", type: "select" },
    { name: "avg_daily_usage_hours", label: "Average daily usage", type: "float", min: 0, max: 24 },
    { name: "daily_unlocks", label: "Daily unlocks", type: "int", min: 0 },
    { name: "study_hours", label: "Study hours", type: "float", min: 0, max: 24 },
    { name: "physical_activity_hours", label: "Physical activity hours", type: "float", min: 0, max: 24 },
    { name: "sleep_hours_per_night", label: "Sleep hours per night", type: "float", min: 0, max: 24 },
    { name: "stress_level", label: "Stress level", type: "select" },
  ];

  const $ = (id) => document.getElementById(id);
  const form = $("assessmentForm");
  const submitBtn = $("submitBtn");
  const formAlert = $("formAlert");
  const formCard = $("formCard");
  const resultCard = $("resultCard");
  let isSubmitting = false;

  /* ---------- Setup ---------- */
  function init() {
    $("countryList").innerHTML = [...BACKEND_COUNTRIES, ...EXTRA_COUNTRIES]
      .map((c) => `<option value="${c}"></option>`).join("");
    $("year").textContent = `© ${new Date().getFullYear()}`;

    const toggle = $("navToggle"), menu = $("navMenu");
    toggle.addEventListener("click", () => {
      const open = menu.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    menu.addEventListener("click", (e) => {
      if (e.target.closest("a")) { menu.classList.remove("open"); toggle.setAttribute("aria-expanded", "false"); }
    });

    form.addEventListener("submit", handleSubmit);
    form.addEventListener("input", (e) => { if (e.target.name) validateField(FIELDS.find((f) => f.name === e.target.name), true); });
    $("tryAgainBtn").addEventListener("click", showForm);
    $("printBtn").addEventListener("click", () => { $("resultCard").querySelector("details").open = true; window.print(); });
  }

  /* ---------- Validation ---------- */
  function setError(field, message) {
    const wrap = $(field.name).closest(".field");
    $(`${field.name}-error`).textContent = message;
    wrap.classList.toggle("invalid", Boolean(message));
    $(field.name).setAttribute("aria-invalid", message ? "true" : "false");
    return !message;
  }

  // Returns true if valid. `quiet` skips the "required" message while the user is still typing.
  function validateField(field, quiet = false) {
    const raw = $(field.name).value.trim();
    if (raw === "") return setError(field, quiet ? "" : `${field.label} is required.`);

    if (field.type === "int" || field.type === "float") {
      const num = Number(raw);
      if (!Number.isFinite(num)) return setError(field, "Enter a valid number.");
      if (field.type === "int" && !Number.isInteger(num)) return setError(field, "Enter a whole number.");
      if (field.min !== undefined && num < field.min) return setError(field, `Must be at least ${field.min}.`);
      if (field.max !== undefined && num > field.max) return setError(field, `Must be at most ${field.max}.`);
    }
    return setError(field, "");
  }

  function validateAll() {
    const results = FIELDS.map((f) => validateField(f));
    const firstBad = FIELDS.find((f, i) => !results[i]);
    if (firstBad) $(firstBad.name).focus();
    return !firstBad;
  }

  /* ---------- Payload ---------- */
  function buildPayload() {
    const payload = {};
    FIELDS.forEach((f) => {
      const v = $(f.name).value.trim();
      payload[f.name] = f.type === "int" || f.type === "float" ? Number(v) : v;
    });
    return payload;
  }

  /* ---------- Submit ---------- */
  async function handleSubmit(event) {
    event.preventDefault();
    if (isSubmitting) return;
    hideAlert();

    if (!validateAll()) {
      showAlert("Please fix the highlighted fields and try again.");
      return;
    }

    const payload = buildPayload();
    setLoading(true);
    try {
      const response = await fetch(PREDICT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw await buildHttpError(response);

      const data = await response.json();
      const score = data.predicted_mental_health_score;
      if (typeof score !== "number" || !Number.isFinite(score)) {
        throw new Error("The server replied, but the response did not contain a valid predicted_mental_health_score.");
      }
      showResult(score, payload);
    } catch (err) {
      const isNetwork = err instanceof TypeError; // fetch() rejects with TypeError on network/CORS failure
      showAlert(isNetwork
        ? `Could not reach the prediction server at ${API_BASE_URL}. Make sure FastAPI is running (uvicorn main:app --reload) and try again.`
        : err.message);
    } finally {
      setLoading(false); // always reset, success or failure
    }
  }

  // Turn an HTTP error response into a friendly Error.
  async function buildHttpError(response) {
    let body = null;
    try { body = await response.json(); } catch (_) { /* not JSON */ }

    if (response.status === 422 && body && Array.isArray(body.detail)) {
      const lines = body.detail.map((d) => `${(d.loc || []).slice(1).join(".") || "input"}: ${d.msg}`);
      return new Error(`The server rejected some values – ${lines.join("; ")}`);
    }
    if (response.status >= 500) {
      return new Error("The server hit an error while computing the prediction (HTTP " + response.status + "). Check the FastAPI terminal for details.");
    }
    return new Error(`Request failed (HTTP ${response.status}).`);
  }

  function setLoading(on) {
    isSubmitting = on;
    submitBtn.disabled = on;
    submitBtn.classList.toggle("is-loading", on);
    submitBtn.setAttribute("aria-busy", String(on));
    $("loadingText").hidden = !on;
  }

  function showAlert(msg) { formAlert.textContent = msg; formAlert.hidden = false; }
  function hideAlert() { formAlert.hidden = true; formAlert.textContent = ""; }

  /* ---------- Results ---------- */
  function showResult(score, payload) {
    renderSummary(payload);
    formCard.hidden = true;
    resultCard.hidden = false;
    countUp($("scoreValue"), score);
    updateGauge(score);
    resultCard.focus();
    resultCard.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function renderSummary(payload) {
    const list = $("summaryList");
    list.innerHTML = "";
    FIELDS.forEach((f) => {
      const dt = document.createElement("dt"); dt.textContent = f.label;
      const dd = document.createElement("dd"); dd.textContent = payload[f.name]; // textContent avoids HTML injection
      list.append(dt, dd);
    });
  }

  // Animates to the real score; skips animation if the user prefers reduced motion.
  function countUp(el, target) {
    const text = target.toFixed(2);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { el.textContent = text; return; }
    const start = performance.now(), duration = 900;
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      el.textContent = (target * (1 - Math.pow(1 - p, 3))).toFixed(2);
      if (p < 1) requestAnimationFrame(tick); else el.textContent = text;
    };
    requestAnimationFrame(tick);
  }

  // Rotates the needle (-90deg = far left, +90deg = far right) and names the third the score falls in.
  function updateGauge(score) {
    const clamped = Math.min(Math.max(score, GAUGE_MIN), GAUGE_MAX);
    const fraction = (clamped - GAUGE_MIN) / (GAUGE_MAX - GAUGE_MIN);
    const needle = $("gaugeNeedle");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    needle.style.transition = reduce ? "none" : "";
    needle.style.transform = "rotate(-90deg)";      // reset so the sweep animates every time
    void needle.getBoundingClientRect();            // force reflow
    needle.style.transform = `rotate(${-90 + fraction * 180}deg)`;

    const band = fraction < 1 / 3 ? "Lower range" : fraction < 2 / 3 ? "Middle range" : "Higher range";
    const color = fraction < 1 / 3 ? "#e5484d" : fraction < 2 / 3 ? "#b98200" : "#1f8a5b";
    $("gaugeBand").textContent = band;
    $("gaugeBand").style.color = color;
    const outside = score < GAUGE_MIN || score > GAUGE_MAX ? " This score is outside the range seen in training." : "";
    $("gaugeCaption").textContent = `Position among scores in the training data (${GAUGE_MIN}–${GAUGE_MAX}). Colour bands are equal thirds, not clinical categories.${outside}`;
  }

  function showForm() {
    resultCard.hidden = true;
    formCard.hidden = false; // entered values are kept
    formCard.scrollIntoView({ behavior: "smooth", block: "start" });
    $("age").focus({ preventScroll: true });
  }

  init();
})();
