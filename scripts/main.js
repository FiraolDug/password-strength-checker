const passwordInput = document.getElementById('passwordInput');
const togglePassword = document.getElementById('togglePassword');
const strengthText = document.getElementById('strengthText');
const copyBtn = document.getElementById('copyPassword');

const bars = [
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

// Check strength and update UI
function checkPasswordStrength(password) {
  let strength = 0;
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password)
  };

  for (const key in checks) {
    if (checks[key]) {
      strength++;
      suggestions[key].classList.add('text-green-600');
      suggestions[key].classList.remove('text-gray-600');
    } else {
      suggestions[key].classList.add('text-gray-600');
      suggestions[key].classList.remove('text-green-600');
    }
  }

  // Reset bars
  bars.forEach(bar => bar.className = 'flex-1 h-3 rounded bg-gray-200 transition-colors');

  // Update bars and strength label
  const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-300', 'bg-green-500'];
  let strengthLabel = ['Weak', 'Fair', 'Moderate', 'Strong', 'Very Strong'];

  for (let i = 0; i < strength; i++) {
    bars[i].classList.add(colors[strength-1]);
  }

  strengthText.textContent = password ? `Strength: ${strengthLabel[strength-1]}` : 'Enter a password';
}

// Input event
passwordInput.addEventListener('input', () => {
  checkPasswordStrength(passwordInput.value);
});

// Toggle visibility
togglePassword.addEventListener('click', () => {
  const type = passwordInput.type === 'password' ? 'text' : 'password';
  passwordInput.type = type;
  togglePassword.innerHTML = type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
});


copyBtn.addEventListener('click',()=>{
    copyBtn.innerHTML = 'copied!';

    navigator.clipboard.writeText(passwordInput.value);
    setTimeout(() => {
        copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
    }, 2000);
})
