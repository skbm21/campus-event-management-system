/**
 * DLSU Campus Event Management System — script.js
 *
 * Responsibilities:
 *  1. Pre-fill the Event dropdown when the user clicks a card's "Register" button.
 *  2. Validate the registration form on submit.
 *  3. Display friendly, accessible error messages via aria-live regions.
 *  4. Show a success confirmation banner with registration summary.
 *
 * Accessibility notes are inline where behaviour affects AT (Assistive Technology).
 */

/* ── ELEMENT REFERENCES ──────────────────────────────────────── */
const form          = document.getElementById('registration-form');
const submitBtn     = document.getElementById('submit-btn');
const successBanner = document.getElementById('success-banner');
const successDetail = document.getElementById('success-detail');

// Form fields
const fieldFullName = document.getElementById('full-name');
const fieldStudentId= document.getElementById('student-id');
const fieldEmail    = document.getElementById('student-email');
const fieldEvent    = document.getElementById('event-select');

// Error containers (all have role="alert" aria-live="polite")
const errorFullName = document.getElementById('full-name-error');
const errorStudentId= document.getElementById('student-id-error');
const errorEmail    = document.getElementById('student-email-error');
const errorEvent    = document.getElementById('event-select-error');

/* ── VALIDATION RULES ────────────────────────────────────────── */
/**
 * Validate a single field and update its aria-invalid + error message.
 *
 * @param {HTMLElement} input        - The form control element.
 * @param {HTMLElement} errorEl      - The sibling error container.
 * @param {Function}    rulesFn      - Returns an error string or '' if valid.
 * @returns {boolean} true if the field is valid.
 */
function validateField(input, errorEl, rulesFn) {
  const message = rulesFn(input.value.trim());

  if (message) {
    // Mark field as invalid — screen readers announce this state change
    // when the user revisits the control.
    input.setAttribute('aria-invalid', 'true');

    // Inject error text; because the container has aria-live="polite"
    // AT will announce the new text after finishing current speech.
    errorEl.querySelector('.error-text').textContent = message;
    errorEl.classList.add('is-visible');

    return false;
  } else {
    input.setAttribute('aria-invalid', 'false');
    errorEl.querySelector('.error-text').textContent = '';
    errorEl.classList.remove('is-visible');
    return true;
  }
}

/** Rules for each field — returns error message string or empty string. */
const rules = {
  fullName(value) {
    if (!value) return 'Full name is required.';
    if (value.length < 3) return 'Full name must be at least 3 characters.';
    if (!/^[A-Za-zÀ-ÖØ-öø-ÿ\s'\-.,]+$/.test(value)) return 'Full name may only contain letters, spaces, and hyphens.';
    return '';
  },

  studentId(value) {
    if (!value) return 'Student ID is required.';
    if (!/^\d{6,10}$/.test(value)) return 'Student ID must be 6–10 digits (numbers only).';
    return '';
  },

  email(value) {
    if (!value) return 'Student email is required.';
    // Friendly domain check — the main requirement from the spec.
    if (!value.toLowerCase().endsWith('@univ.edu.ph')) {
      return 'Email must end with @univ.edu.ph (e.g. juan.delacruz@univ.edu.ph).';
    }
    // Basic structural check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) return 'Please enter a valid email address.';
    return '';
  },

  event(value) {
    if (!value) return 'Please select an event to register for.';
    return '';
  },
};

/* ── REAL-TIME VALIDATION ON BLUR ────────────────────────────── */
/**
 * Validate fields when the user moves focus away (blur).
 * This avoids showing errors while the user is mid-typing, which
 * would be disruptive for screen reader users.
 */
fieldFullName.addEventListener('blur', () => validateField(fieldFullName, errorFullName, rules.fullName));
fieldStudentId.addEventListener('blur', () => validateField(fieldStudentId, errorStudentId, rules.studentId));
fieldEmail.addEventListener('blur',    () => validateField(fieldEmail,    errorEmail,    rules.email));
fieldEvent.addEventListener('change',  () => validateField(fieldEvent,    errorEvent,    rules.event));

/* ── FORM SUBMIT HANDLER ─────────────────────────────────────── */
form.addEventListener('submit', function handleSubmit(event) {
  // Always prevent default to control UX manually
  event.preventDefault();

  // Run all validations and collect results
  const validations = [
    validateField(fieldFullName, errorFullName, rules.fullName),
    validateField(fieldStudentId, errorStudentId, rules.studentId),
    validateField(fieldEmail,    errorEmail,    rules.email),
    validateField(fieldEvent,    errorEvent,    rules.event),
  ];

  const allValid = validations.every(Boolean);

  if (!allValid) {
    /**
     * Move focus to the first invalid field.
     * This is critical for keyboard and screen-reader users — without it
     * they have no indication of where the errors are located.
     */
    const firstInvalid = form.querySelector('[aria-invalid="true"]');
    if (firstInvalid) {
      firstInvalid.focus();
      // Smooth-scroll so the field is visible (respected unless
      // prefers-reduced-motion is set — the CSS handles that).
      firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    return;
  }

  // ── ALL FIELDS VALID — show success state ──────────────────
  showSuccess();
});

/* ── SUCCESS STATE ───────────────────────────────────────────── */
function showSuccess() {
  // Gather submission data for the summary
  const name      = fieldFullName.value.trim();
  const studentId = fieldStudentId.value.trim();
  const email     = fieldEmail.value.trim();
  const eventText = fieldEvent.options[fieldEvent.selectedIndex].text;

  // Build summary HTML injected into the success banner
  successDetail.innerHTML = `
    <p style="margin-bottom:0.5rem;font-weight:700;color:#065f46;">Registration Summary</p>
    <table style="border-collapse:collapse;width:100%;" aria-label="Registration summary details">
      <tbody>
        <tr><td style="padding:4px 8px 4px 0;font-weight:600;white-space:nowrap;">Name</td><td style="padding:4px 0;">${escapeHtml(name)}</td></tr>
        <tr><td style="padding:4px 8px 4px 0;font-weight:600;white-space:nowrap;">Student ID</td><td style="padding:4px 0;">${escapeHtml(studentId)}</td></tr>
        <tr><td style="padding:4px 8px 4px 0;font-weight:600;white-space:nowrap;">Email</td><td style="padding:4px 0;">${escapeHtml(email)}</td></tr>
        <tr><td style="padding:4px 8px 4px 0;font-weight:600;white-space:nowrap;">Event</td><td style="padding:4px 0;">${escapeHtml(eventText)}</td></tr>
      </tbody>
    </table>
  `;

  // Show the banner (CSS transition plays via the 'is-visible' class)
  successBanner.classList.add('is-visible');

  // Hide the form to prevent re-submission
  form.setAttribute('hidden', '');

  /**
   * Move focus to the success banner so screen-reader users hear
   * the confirmation announced immediately (banner has role="alert"
   * aria-live="assertive" which announces on insertion, but focus
   * ensures the context is clear and browser focus order is correct).
   */
  successBanner.setAttribute('tabindex', '-1');
  successBanner.focus();

  // Scroll to banner
  successBanner.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ── REGISTER BUTTONS ON EVENT CARDS ───────────────────────────── */
/**
 * When a user clicks "Register" on an event card:
 * 1. Pre-select the corresponding option in the Event dropdown.
 * 2. Scroll the registration form into view.
 * 3. Move focus to the first empty form field to guide the user.
 *
 * This is a quality-of-life feature that also benefits keyboard users who
 * navigate cards sequentially and then want to jump straight to the form.
 */
document.querySelectorAll('.register-btn').forEach(function(btn) {
  btn.addEventListener('click', function() {
    const eventId = this.dataset.eventId;

    // Pre-select the matching option in the dropdown
    const matchingOption = fieldEvent.querySelector(`option[value="${eventId}"]`);
    if (matchingOption && !matchingOption.disabled) {
      fieldEvent.value = eventId;
      // Clear any existing error on that field since the user just chose a value
      validateField(fieldEvent, errorEvent, rules.event);
    }

    // Scroll the registration section into view
    const registerSection = document.getElementById('register-section');
    registerSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // After scroll animation, move focus to the first empty field
    // so keyboard users don't have to Tab through the whole catalog again.
    setTimeout(function() {
      const emptyField = [fieldFullName, fieldStudentId, fieldEmail].find(
        function(f) { return !f.value.trim(); }
      );
      (emptyField || submitBtn).focus({ preventScroll: true });
    }, 500); // slight delay to allow scroll to settle
  });
});

/* ── UTILITY: HTML ESCAPE ────────────────────────────────────── */
/**
 * Sanitize user input before injecting into innerHTML.
 * Prevents XSS when building the success summary table.
 */
function escapeHtml(str) {
  return str
    .replace(/&/g,  '&amp;')
    .replace(/</g,  '&lt;')
    .replace(/>/g,  '&gt;')
    .replace(/"/g,  '&quot;')
    .replace(/'/g,  '&#39;');
}

/* ── STUDENT ID: DIGITS-ONLY INPUT ──────────────────────────── */
/**
 * Prevent non-numeric keystrokes on the Student ID field.
 * Note: This is a convenience filter, not a security measure.
 * The regex validation in rules.studentId() is the authoritative check.
 */
fieldStudentId.addEventListener('keydown', function(event) {
  // Allow control keys (Backspace, Delete, Tab, Arrow keys, etc.)
  const controlKeys = [
    'Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight',
    'Home', 'End', 'Enter',
  ];
  if (controlKeys.includes(event.key)) return;
  // Allow Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
  if (event.ctrlKey || event.metaKey) return;
  // Block any key that isn't a digit
  if (!/^\d$/.test(event.key)) {
    event.preventDefault();
  }
});
