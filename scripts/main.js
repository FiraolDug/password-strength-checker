/**
 * Password Strength Checker
 * Provides live feedback on password strength based on length, character types,
 * entropy, and common password blacklist. Includes visibility toggle and copy functionality.
 * Integrates with Tailwind CSS and Font Awesome for styling and icons.
 */

/* DOM Elements */
const passwordInput = document.getElementById('passwordInput');
const togglePassword = document.getElementById('togglePassword');
const copyBtn = document.getElementById('copyPassword');
const strengthText = document.getElementById('strengthText');
const strengthBars = [
    document.getElementById('bar1'),
    document.getElementById('bar2'),
    document.getElementById('bar3'),
    document.getElementById('bar4'),
    document.getElementById('bar5')
];


const suggestions = {
    length: document.getElementById('length'),
    uppercase: document.getElementById('uppercase'),
    lowercase: document.getElementById('lowercase'),
    number: document.getElementById('number'),
    special: document.getElementById('special')
};

/* Constants */
const STRENGTH_LEVELS = ['Weak', 'Fair', 'Moderate', 'Strong', 'Very Strong'];
const STRENGTH_COLORS = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-300', 'bg-green-500'];
const ENTROPY_THRESHOLDS = {
    veryWeak: 28, // Below 28 bits: easily guessable
    weak: 36,     // 28-35 bits: weak but better than very weak
    moderate: 60, // 36-59 bits: reasonable for low-security contexts
    strong: 128   // 60-127 bits: strong for most applications
};
let commonPasswords = new Set();

/**
 * Fetches common passwords from a file and stores them in a Set for efficient lookup.
  * @returns {Promise<void>}
 */
async function fetchCommonPasswords() {
    try {
        const response = await fetch('assets/most-common-passwords.txt');
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const text = await response.text();
        commonPasswords = new Set(text.split('\n').map(pw => pw.trim().toLowerCase()));
        console.log(`Loaded ${commonPasswords.size} common passwords`);
    } catch (err) {
        console.error('Failed to load common passwords:', err);
        commonPasswords = new Set(); // Fallback to empty set
        strengthText.textContent = 'Error loading common passwords. Strength checking limited.';
        strengthText.classList.add('text-red-600');
    }
}

/**
 * Checks if the password is in the common passwords list (case-insensitive).
 * @param {string} password - The password to check.
 * @returns {boolean} True if the password is blacklisted.
 */
function isBlackListed(password) {
    return commonPasswords.has(password.toLowerCase());
}

/**
 * Calculates the entropy of a password based on its character set and length.
 * @param {string} password - The password to evaluate.
 * @returns {number} The entropy in bits, rounded to the nearest integer.
 */
function calculateEntropy(password) {
    let charsetSize = 0;
    if (/[a-z]/.test(password)) charsetSize += 26; // Lowercase
    if (/[A-Z]/.test(password)) charsetSize += 26; // Uppercase
    if (/[0-9]/.test(password)) charsetSize += 10; // Numbers
    if (/[^A-Za-z0-9]/.test(password)) charsetSize += 32; // Special characters

    if (charsetSize === 0) return 0;
    return Math.round(Math.log2(Math.pow(charsetSize, password.length)));
}

/**
 * Updates the UI with password strength feedback based on character criteria and entropy.
 * @param {string} password - The password to evaluate.
 */
function checkPasswordStrength(password) {
    // Character-based strength checks
    const checks = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
        special: /[^A-Za-z0-9]/.test(password)
    };

    const strength = Object.values(checks).filter(Boolean).length;

    // Update suggestion highlights
    for (const [key, element] of Object.entries(suggestions)) {
        element.classList.toggle('text-green-600', checks[key]);
        element.classList.toggle('text-gray-600', !checks[key]);
    }

    // Reset and update strength bars
    strengthBars.forEach(bar => bar.classList.remove(...STRENGTH_COLORS));
    if (password) {
        for (let i = 0; i < strength; i++) {
            strengthBars[i].classList.add(STRENGTH_COLORS[strength - 1]);
        }
    }

    // Calculate entropy and determine label
    const entropy = calculateEntropy(password);
    let entropyLabel = 'Very Weak';
    if (entropy >= ENTROPY_THRESHOLDS.strong) entropyLabel = 'Very Strong';
    else if (entropy >= ENTROPY_THRESHOLDS.moderate) entropyLabel = 'Strong';
    else if (entropy >= ENTROPY_THRESHOLDS.weak) entropyLabel = 'Moderate';
    else if (entropy >= ENTROPY_THRESHOLDS.veryWeak) entropyLabel = 'Weak';

    // Update strength text
    if (password && isBlackListed(password)) {
        strengthText.textContent = `⚠️ This password is too common! (${entropy} bits)`;
        strengthText.classList.add('text-red-600');
    } else {
        strengthText.textContent = password ? `Strength: ${entropyLabel} (${entropy} bits)` : 'Enter a password';
        strengthText.classList.remove('text-red-600');
    }
}

/**
 * Toggles password visibility between text and password types using Font Awesome icons.
 */
function togglePasswordVisibility() {
    const isPassword = passwordInput.type === 'password';
    passwordInput.type = isPassword ? 'text' : 'password';
    togglePassword.innerHTML = isPassword ? '<i class="fas fa-eye-slash"></i>' : '<i class="fas fa-eye"></i>';
}

/**
 * Copies the password to the clipboard and provides visual feedback.
 */
function copyPassword() {
    if (!passwordInput.value) {
        copyBtn.textContent = 'Empty!';
        copyBtn.classList.add('bg-red-500', 'text-white');
        setTimeout(() => {
            copyBtn.textContent = 'Copy';
            copyBtn.classList.remove('bg-red-500', 'text-white');
        }, 2000);
        return;
    }

    navigator.clipboard.writeText(passwordInput.value).then(() => {
        copyBtn.textContent = 'Copied!';
        copyBtn.classList.add('bg-green-500', 'text-white');
        setTimeout(() => {
            copyBtn.textContent = 'Copy';
            copyBtn.classList.remove('bg-green-500', 'text-white');
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy password:', err);
        copyBtn.textContent = 'Error!';
        copyBtn.classList.add('bg-red-500', 'text-white');
        setTimeout(() => {
            copyBtn.textContent = 'Copy';
            copyBtn.classList.remove('bg-red-500', 'text-white');
        }, 2000);
    });
}

/* Event Listeners */
passwordInput.addEventListener('input', () => checkPasswordStrength(passwordInput.value));
togglePassword.addEventListener('click', togglePasswordVisibility);
copyBtn?.addEventListener('click', copyPassword);
window.addEventListener('DOMContentLoaded', fetchCommonPasswords);