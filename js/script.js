/* ==========================================================================
   Tastes of Africa: script.js
   Shared by every page. It is loaded in the <head> WITHOUT "defer", so:
     - Part 0 runs straight away, before the page is drawn
       (this is what stops the light theme from "flashing" dark first).
     - Everything else waits for the DOMContentLoaded event, which fires
       once the whole HTML page has been read and every element exists.

   Contents
     0. Runs immediately: "js" class, storage helpers, saved theme
     1. Start-up: run every feature once the page has loaded
     2. Dark / light theme toggle
     3. Mobile hamburger menu
     4. Recipe filter (home page and recipes.html)
     5. Favorites (heart buttons, saved in localStorage)
     6. Ingredient scaler (recipe pages)
     7. Contact form validation (contact.html)
     8. Scroll fade-in for browsers without the CSS-only version
     9. Newsletter signup (home page)

   Each feature first looks for its elements. If they are not on the
   current page, the feature stops ("return") so nothing breaks.
   ========================================================================== */


/* --------------------------------------------------------------------------
   0. RUNS IMMEDIATELY
   -------------------------------------------------------------------------- */

// Add the class "js" to <html>. The CSS uses it to style things that only
// work with JavaScript (for example the collapsed mobile menu).
document.documentElement.classList.add("js");

// Names of the keys we use in localStorage
const THEME_KEY = "toa-theme";          // "light" or "dark"
const FAVORITES_KEY = "toa-favorites";  // a list of recipe ids, e.g. ["isombe"]

// A simple email check used by both forms: something@something.something, no spaces
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// localStorage keeps small pieces of text in the browser, even after it is
// closed. In some private-browsing modes it is blocked and throws an error,
// so these two helpers use try...catch to keep the rest of the script working.
function readStorage(key) {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    return null;
  }
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    // Storage is not available: the feature still works until the page reloads.
  }
}

// Apply the saved theme now, before the page is drawn.
// Dark is the default, so we only need to act when "light" was saved.
if (readStorage(THEME_KEY) === "light") {
  document.documentElement.setAttribute("data-theme", "light");
}


/* --------------------------------------------------------------------------
   1. START-UP
   Wait until all the HTML has loaded, then set up each feature.
   -------------------------------------------------------------------------- */

document.addEventListener("DOMContentLoaded", function () {
  setUpThemeToggle();
  setUpMobileMenu();
  setUpRecipeFilter();
  setUpFavorites();
  setUpIngredientScaler();
  setUpContactForm();
  setUpScrollReveal();
  setUpNewsletter();
});


/* --------------------------------------------------------------------------
   2. DARK / LIGHT THEME TOGGLE
   The CSS switches every color when <html> has data-theme="light".
   The sun/moon icons are swapped by the CSS too; here we update the
   button's label so screen readers say what the button will do.
   -------------------------------------------------------------------------- */

function setUpThemeToggle() {
  const button = document.querySelector(".theme-toggle");
  if (!button) {
    return;
  }

  updateThemeButton(button);

  button.addEventListener("click", function () {
    const html = document.documentElement;

    if (html.getAttribute("data-theme") === "light") {
      html.removeAttribute("data-theme");   // back to the dark default
      writeStorage(THEME_KEY, "dark");
    } else {
      html.setAttribute("data-theme", "light");
      writeStorage(THEME_KEY, "light");
    }

    updateThemeButton(button);
  });
}

function updateThemeButton(button) {
  const isLight = document.documentElement.getAttribute("data-theme") === "light";
  const label = isLight ? "Switch to dark theme" : "Switch to light theme";

  button.setAttribute("aria-label", label);  // read by screen readers
  button.setAttribute("title", label);       // tooltip on mouse hover
}


/* --------------------------------------------------------------------------
   3. MOBILE HAMBURGER MENU
   On small screens the CSS hides the navigation unless it has the class
   "is-open". aria-expanded tells screen readers whether it is open.
   -------------------------------------------------------------------------- */

function setUpMobileMenu() {
  const button = document.querySelector(".menu-toggle");
  const nav = document.getElementById("site-nav");
  if (!button || !nav) {
    return;
  }

  function openMenu() {
    nav.classList.add("is-open");
    button.setAttribute("aria-expanded", "true");
  }

  function closeMenu() {
    nav.classList.remove("is-open");
    button.setAttribute("aria-expanded", "false");
  }

  // The hamburger button opens the menu, or closes it if it is already open
  button.addEventListener("click", function () {
    if (nav.classList.contains("is-open")) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  // Choosing a link closes the menu (useful for links to the same page)
  const links = nav.querySelectorAll("a");
  links.forEach(function (link) {
    link.addEventListener("click", closeMenu);
  });

  // Keyboard users can close the menu with the Escape key
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && nav.classList.contains("is-open")) {
      closeMenu();
      button.focus();   // put the keyboard focus back on the button
    }
  });
}


/* --------------------------------------------------------------------------
   4. RECIPE FILTER
   Each filter button has data-filter="west-africa" (or "all").
   Each card has data-region="west-africa". Cards that don't match get the
   class "hidden" (display: none in the CSS).
   -------------------------------------------------------------------------- */

function setUpRecipeFilter() {
  // Only real <button>s: the region switcher uses links with the same style
  const buttons = document.querySelectorAll("button.filter-btn[data-filter]");
  const cards = document.querySelectorAll("[data-region]");
  if (buttons.length === 0 || cards.length === 0) {
    return;
  }

  buttons.forEach(function (button) {
    button.addEventListener("click", function () {
      const chosenRegion = button.dataset.filter;   // reads data-filter

      // Show or hide every card
      cards.forEach(function (card) {
        if (chosenRegion === "all" || card.dataset.region === chosenRegion) {
          card.classList.remove("hidden");
        } else {
          card.classList.add("hidden");
        }
      });

      // Mark only the clicked button as active (the CSS styles aria-pressed="true")
      buttons.forEach(function (otherButton) {
        otherButton.setAttribute("aria-pressed", otherButton === button ? "true" : "false");
      });
    });
  });
}


/* --------------------------------------------------------------------------
   5. FAVORITES
   Every heart button has data-id="jollof-rice" (the recipe's id).
   The ids of saved recipes are kept in localStorage as a list, so the same
   hearts are filled on every page and after the browser is closed.
   aria-pressed="true" fills the heart red (see .fav-btn in the CSS).
   -------------------------------------------------------------------------- */

// Read the saved list. localStorage only stores text, so the list is saved
// as JSON text and turned back into an array with JSON.parse().
function getFavorites() {
  const savedText = readStorage(FAVORITES_KEY);
  if (!savedText) {
    return [];
  }

  try {
    const list = JSON.parse(savedText);
    return Array.isArray(list) ? list : [];
  } catch (error) {
    return [];   // the saved text was not valid JSON: start again
  }
}

function saveFavorites(list) {
  writeStorage(FAVORITES_KEY, JSON.stringify(list));
}

function setUpFavorites() {
  const buttons = document.querySelectorAll(".fav-btn[data-id]");
  if (buttons.length === 0) {
    return;
  }

  // On page load: fill in every heart that was saved before
  showSavedHearts(buttons);

  buttons.forEach(function (button) {
    button.addEventListener("click", function () {
      const recipeId = button.dataset.id;   // reads data-id
      let favorites = getFavorites();

      if (favorites.includes(recipeId)) {
        // Already saved: remove it from the list
        favorites = favorites.filter(function (id) {
          return id !== recipeId;
        });
      } else {
        // Not saved yet: add it to the list
        favorites.push(recipeId);
      }

      saveFavorites(favorites);

      // Update ALL hearts, so a recipe shown twice on one page stays in sync
      showSavedHearts(buttons);
    });
  });

  // If the favorites change in another open tab, update this page as well
  window.addEventListener("storage", function (event) {
    if (event.key === FAVORITES_KEY) {
      showSavedHearts(buttons);
    }
  });
}

function showSavedHearts(buttons) {
  const favorites = getFavorites();

  buttons.forEach(function (button) {
    const isSaved = favorites.includes(button.dataset.id);
    button.setAttribute("aria-pressed", isSaved ? "true" : "false");
  });
}


/* --------------------------------------------------------------------------
   6. INGREDIENT SCALER
   The servings input has data-base-servings="4" (what the recipe is
   written for). Each amount looks like:
     <span class="qty" data-amount="400" data-unit="g">400 g</span>
   New amount = base amount ÷ base servings × chosen servings.
   "To taste" items have no data-amount, so they are never changed.
   -------------------------------------------------------------------------- */

function setUpIngredientScaler() {
  const input = document.getElementById("servings");
  const amounts = document.querySelectorAll(".qty[data-amount]");
  if (!input || amounts.length === 0) {
    return;
  }

  const baseServings = Number(input.dataset.baseServings);

  function updateAmounts() {
    const servings = Number(input.value);

    // Ignore an empty box or a number below 1 while the user is still typing
    if (!servings || servings < 1) {
      return;
    }

    amounts.forEach(function (qty) {
      const baseAmount = Number(qty.dataset.amount);
      const unit = qty.dataset.unit;
      const newAmount = roundAmount((baseAmount / baseServings) * servings, unit);

      // Write "600 g", or just "3" when there is no unit (e.g. 3 onions)
      qty.textContent = unit ? newAmount + " " + unit : String(newAmount);
    });
  }

  // "input" fires on every key press and every click of the little arrows
  input.addEventListener("input", updateAmounts);

  // "change" fires when the user leaves the box. If it was left empty or
  // below 1, put the original number back.
  input.addEventListener("change", function () {
    if (!Number(input.value) || Number(input.value) < 1) {
      input.value = baseServings;
      updateAmounts();
    }
  });
}

// Round to amounts a cook can actually measure:
//   grams and millilitres -> whole numbers (e.g. 333.33 g -> 333 g)
//   everything else       -> nearest quarter (e.g. 1.4999 tbsp -> 1.5 tbsp)
function roundAmount(amount, unit) {
  let rounded;

  if (unit === "g" || unit === "ml") {
    rounded = Math.max(1, Math.round(amount));
  } else {
    rounded = Math.max(0.25, Math.round(amount * 4) / 4);
  }

  return rounded;
}


/* --------------------------------------------------------------------------
   7. CONTACT FORM VALIDATION
   Rules: name and email are filled in (and the email looks real), a country
   is chosen in the list OR typed in the text box, and the message has more
   than 20 characters. Errors appear next to each field and as a summary in
   #form-error. When everything is fine, the form is swapped for a thank-you.
   -------------------------------------------------------------------------- */

function setUpContactForm() {
  const form = document.getElementById("contact-form");
  if (!form) {
    return;
  }

  const nameInput = document.getElementById("name");
  const emailInput = document.getElementById("email");
  const countrySelect = document.getElementById("country");
  const countryInput = document.getElementById("country-other");
  const messageInput = document.getElementById("message");

  const formError = document.getElementById("form-error");
  const successBox = document.getElementById("form-success");
  const successMessage = document.getElementById("success-message");

  // Turn off the browser's own pop-up bubbles: we show clearer messages.
  // (Without JavaScript, the "required" attributes still protect the form.)
  form.noValidate = true;

  // Becomes true after the first click on "Send". From then on, the
  // messages next to the fields update as the user types.
  let hasTriedToSend = false;

  form.addEventListener("submit", function (event) {
    event.preventDefault();   // stop the page from reloading
    hasTriedToSend = true;

    const problems = checkForm();

    if (problems.length > 0) {
      // Summary at the top, e.g. "Please fix 2 problems: Name, Message."
      const word = problems.length === 1 ? "problem" : "problems";
      const fieldNames = problems.map(function (problem) {
        return problem.name;
      });
      formError.textContent = "Please fix " + problems.length + " " + word + ": " + fieldNames.join(", ") + ".";

      // Move the cursor to the first field that needs fixing
      problems[0].field.focus();
      return;
    }

    // Everything is valid: hide the form and show the thank-you message
    const name = nameInput.value.trim();
    formError.textContent = "";
    form.classList.add("hidden");
    // textContent (not innerHTML) so whatever the user typed is shown as plain text
    successMessage.textContent = "Thank you, " + name + "! We've received your message.";
    successBox.classList.remove("hidden");
    successBox.focus();   // screen readers read the message straight away
  });

  // Live updates while the user corrects the form
  form.addEventListener("input", function () {
    if (!hasTriedToSend) {
      return;
    }
    const problems = checkForm();
    if (problems.length === 0) {
      formError.textContent = "";
    }
  });

  // Checks every field, shows or clears each message, and returns a list
  // of the problems found (an empty list means the form is valid).
  function checkForm() {
    const problems = [];

    // Name
    const name = nameInput.value.trim();
    if (name === "") {
      problems.push({ name: "Name", field: nameInput });
      setFieldError(nameInput, "name-error", "Please enter your name.");
    } else {
      setFieldError(nameInput, "name-error", "");
    }

    // Email: something@something.something, with no spaces
    const email = emailInput.value.trim();
    if (email === "") {
      problems.push({ name: "Email", field: emailInput });
      setFieldError(emailInput, "email-error", "Please enter your email address.");
    } else if (!EMAIL_PATTERN.test(email)) {
      problems.push({ name: "Email", field: emailInput });
      setFieldError(emailInput, "email-error", "Please enter a valid email address, like name@example.com.");
    } else {
      setFieldError(emailInput, "email-error", "");
    }

    // Country: from the list, or typed in the second box
    const chosenCountry = countrySelect.value;     // "" when nothing is chosen
    const typedCountry = countryInput.value.trim();
    const hasListCountry = chosenCountry !== "" && chosenCountry !== "other";

    countrySelect.removeAttribute("aria-invalid");
    countryInput.removeAttribute("aria-invalid");
    if (hasListCountry || typedCountry !== "") {
      document.getElementById("country-error").textContent = "";
    } else if (chosenCountry === "other") {
      // "Other" was chosen but nothing was typed
      problems.push({ name: "Country", field: countryInput });
      setFieldError(countryInput, "country-error", "You chose “Other”: please type your country.");
    } else {
      problems.push({ name: "Country", field: countrySelect });
      setFieldError(countrySelect, "country-error", "Please choose your country, or type it if it is not in the list.");
    }

    // Message: more than 20 characters
    const message = messageInput.value.trim();
    if (message.length <= 20) {
      problems.push({ name: "Message", field: messageInput });
      setFieldError(messageInput, "message-error",
        "Your message has " + message.length + " characters. Please write more than 20.");
    } else {
      setFieldError(messageInput, "message-error", "");
    }

    return problems;
  }
}

// Shows a message next to a field (or clears it when message is "").
// aria-invalid="true" gives the field a saffron border and tells screen
// readers that the field has an error.
function setFieldError(field, errorId, message) {
  document.getElementById(errorId).textContent = message;

  if (message) {
    field.setAttribute("aria-invalid", "true");
  } else {
    field.removeAttribute("aria-invalid");
  }
}


/* --------------------------------------------------------------------------
   8. SCROLL FADE-IN (fallback)
   Newer browsers fade in .reveal sections with CSS alone
   (animation-timeline: view()). For other browsers, an IntersectionObserver
   watches each section and adds "is-visible" when it scrolls into view.
   -------------------------------------------------------------------------- */

function setUpScrollReveal() {
  const sections = document.querySelectorAll(".reveal");
  if (sections.length === 0) {
    return;
  }

  // The CSS-only version already works here: nothing to do
  if (window.CSS && CSS.supports("animation-timeline", "view()")) {
    return;
  }

  // Very old browser: leave everything visible
  if (!("IntersectionObserver" in window)) {
    return;
  }

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");   // fade in (see CSS)
        observer.unobserve(entry.target);           // only once per section
      }
    });
  }, { threshold: 0.15 });   // when 15% of the section is on screen

  sections.forEach(function (section) {
    section.classList.add("will-reveal");   // start hidden (see CSS)
    observer.observe(section);
  });
}


/* --------------------------------------------------------------------------
   9. NEWSLETTER SIGNUP (home page)
   There is no real mailing list behind this form, so instead of sending it
   we check the email address and show a message under the field.
   -------------------------------------------------------------------------- */

function setUpNewsletter() {
  const form = document.getElementById("newsletter-form");
  const input = document.getElementById("newsletter-email");
  const message = document.getElementById("newsletter-message");
  if (!form || !input || !message) {
    return;
  }

  form.noValidate = true;   // show our own message instead of the browser bubble

  form.addEventListener("submit", function (event) {
    event.preventDefault();   // stay on the page
    const email = input.value.trim();

    if (!EMAIL_PATTERN.test(email)) {
      message.textContent = "Please enter a valid email address, like name@example.com.";
      input.setAttribute("aria-invalid", "true");
      input.focus();
      return;
    }

    input.removeAttribute("aria-invalid");
    message.textContent = "Thanks for subscribing! The next recipe goes to " + email + ".";
    form.reset();   // empty the field
  });
}
