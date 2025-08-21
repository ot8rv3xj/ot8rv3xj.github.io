// ===================== Overlay Logic =====================
const overlay = document.getElementById("bookingOverlay");
const btn = document.getElementById("openOverlay");
const span = document.getElementsByClassName("close")[0];

if (btn && overlay && span) {
  btn.onclick = () => (overlay.style.display = "block");
  span.onclick = () => (overlay.style.display = "none");
  window.onclick = (e) => {
    if (e.target == overlay) overlay.style.display = "none";
  };
}

// ===================== Mobile nav toggle =====================
const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");
if (navToggle && navLinks) {
  navToggle.addEventListener("click", () => {
    navLinks.classList.toggle("nav-open");
  });

  const links = navLinks.querySelectorAll("a");
  links.forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("nav-open");
    });
  });
}

// ===================== Company fields toggle =====================
const companyFields = document.querySelector(".company-fields");
const companyInputs = companyFields
  ? companyFields.querySelectorAll("input, select")
  : [];

function updateCompanyFields() {
  const isCompany =
    document.querySelector('input[name="type"]:checked')?.value ===
    "unternehmen";

  if (!companyFields) return;

  companyFields.style.display = isCompany ? "flex" : "none";

  companyInputs.forEach((el) => {
    el.disabled = !isCompany;
    el.required = isCompany;
  });
}

document.querySelectorAll('input[name="type"]').forEach((radio) => {
  radio.addEventListener("change", updateCompanyFields);
});
updateCompanyFields();

// ===================== Multi-step form: Step 1 -> Step 2 =====================
const nextBtn = document.getElementById("next-btn");
if (nextBtn) {
  nextBtn.addEventListener("click", () => {
    const step1 = document.getElementById("step-1");
    const step2 = document.getElementById("step-2");
    const controls = Array.from(
      step1.querySelectorAll("input, select, textarea")
    ).filter((el) => !el.disabled && el.offsetParent !== null);

    const firstInvalid = controls.find((el) => !el.checkValidity());
    if (firstInvalid) {
      firstInvalid.reportValidity();
      firstInvalid.focus();
      return;
    }

    step1.style.display = "none";
    step2.style.display = "block";
  });
}

// ===================== Smooth scroll to form =====================
document.querySelectorAll('a[href="#styled-form"]').forEach((link) => {
  link.addEventListener("click", function (e) {
    e.preventDefault();
    const form = document.querySelector("#styled-form");
    if (form) {
      form.scrollIntoView({ behavior: "smooth", block: "start" });
      setTimeout(() => {
        form.querySelector("input, select, textarea")?.focus();
      }, 600);
    }
  });
});

// ===================== Select2 for languages =====================
$(document).ready(function () {
  $("#source-language").select2({
    placeholder: "Wählen Sie Sprachen",
    tags: true,
    width: "100%",
  });
  $("#target-language").select2({
    placeholder: "Wählen Sie Sprachen",
    tags: true,
    width: "100%",
  });
});

// ===================== Language switch active =====================
document.addEventListener("DOMContentLoaded", () => {
  const langs = document.querySelectorAll(".lang-link");

  if (window.location.pathname.includes("index-en")) {
    document
      .querySelector(
        '.lang-switch-desktop .lang-link[href*="index-en.html"]'
      )
      ?.classList.add("active");
    document
      .querySelector('.lang-switch .lang-link[href*="index-en.html"]')
      ?.classList.add("active");
  } else {
    document
      .querySelector('.lang-switch-desktop .lang-link[href*="index.html"]')
      ?.classList.add("active");
    document
      .querySelector('.lang-switch .lang-link[href*="index.html"]')
      ?.classList.add("active");
  }

  langs.forEach((link) => {
    link.addEventListener("click", () => {
      langs.forEach((l) => l.classList.remove("active"));
      link.classList.add("active");
    });
  });
});

// ===================== Phone input (intl-tel-input) =====================
let iti; // keep reference global
document.addEventListener("DOMContentLoaded", function () {
  const input = document.querySelector("#phone");
  if (!input) return;

  const errorMsg = document.querySelector("#phone-error");

  iti = window.intlTelInput(input, {
    initialCountry: "at",
    preferredCountries: ["at", "de"],
    separateDialCode: true,
    utilsScript:
      "https://cdn.jsdelivr.net/npm/intl-tel-input@17.0.19/build/js/utils.js",
  });

  const form = input.closest("form");
  form.addEventListener("submit", function (e) {
    if (input.value.trim()) {
      if (!iti.isValidNumber()) {
        e.preventDefault();
        input.classList.add("error-input");
        if (errorMsg) {
          errorMsg.style.display = "block";
          errorMsg.textContent =
            document.documentElement.lang === "de"
              ? "❌ Ungültige Telefonnummer. Bitte überprüfen."
              : "❌ Invalid phone number. Please check.";
        }
      } else {
        input.value = iti.getNumber(); // overwrite with E.164
        input.classList.remove("error-input");
        if (errorMsg) errorMsg.style.display = "none";
      }
    }
  });
});

// ===================== Form submission to Google Apps Script =====================
const form = document.getElementById("styled-form");
if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    form.classList.add("loading");

    const formData = new FormData(form);
    if (iti) {
      formData.set("phone", iti.getNumber());
    }

    const data = {};
    for (let [key, value] of formData.entries()) {
      if (data[key]) {
        Array.isArray(data[key])
          ? data[key].push(value)
          : (data[key] = [data[key], value]);
      } else {
        data[key] = value;
      }
    }

    data.siteOrigin = window.location.origin;

    fetch(
      "https://script.google.com/macros/s/AKfycbzKpv3vniidj6EY1tK1MsNq19ZM0ZDJOZVpadLGquE3sVy3O21eZH_0lGUcUMU0Cw0/exec",
      {
        method: "POST",
        mode: "no-cors",
        body: JSON.stringify(data),
      }
    )
      .then(() => {
        form.classList.remove("loading");
        document.getElementById("form-result").style.display = "block";
        document.getElementById("form-success").style.display = "block";

        $("#source-language, #target-language").val(null).trigger("change");

        document.getElementById("step-2").style.display = "none";
        document.getElementById("step-1").style.display = "none";
      })
      .catch(() => {
        form.classList.remove("loading");
        document.getElementById("form-result").style.display = "block";
        document.getElementById("form-result-error").style.display = "block";
        document.getElementById("step-2").style.display = "none";
        document.getElementById("step-1").style.display = "none";
      });
  });
}

// ===================== Reset buttons (new-request, retry) =====================
document.getElementById("new-request")?.addEventListener("click", () => {
  form.reset();
  updateCompanyFields();
  document.getElementById("step-2").style.display = "none";
  document.getElementById("step-1").style.display = "block";
  document.getElementById("form-result").style.display = "none";
  document.getElementById("form-success").style.display = "none";
  document.getElementById("form-result-error").style.display = "none";
});

document.getElementById("retry")?.addEventListener("click", () => {
  form.reset();
  updateCompanyFields();
  document.getElementById("step-2").style.display = "none";
  document.getElementById("step-1").style.display = "block";
  document.getElementById("form-result").style.display = "none";
  document.getElementById("form-success").style.display = "none";
  document.getElementById("form-result-error").style.display = "none";
});