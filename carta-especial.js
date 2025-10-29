// NOTA: Esto es solo para práctica. No guardes contraseñas reales en código cliente.
const correctPassword = "2025";

// Función que oculta todas las pantallas y muestra la solicitada
function setScreenVisible(idToShow) {
  const screens = document.querySelectorAll('.screen');
  screens.forEach(s => {
    s.classList.remove('active');
    s.setAttribute('aria-hidden', 'true');
  });

  const show = document.getElementById(idToShow);
  if (show) {
    show.classList.add('active');
    show.setAttribute('aria-hidden', 'false');
  }
}

// Comprueba la contraseña y muestra el menu si es correcta
function checkPassword() {
  const input = document.getElementById("passwordInput").value.trim();
  const error = document.getElementById("errorMessage");

  if (input === correctPassword) {
    setScreenVisible('menuScreen');
    error.textContent = "";
    document.getElementById('passwordInput').value = '';
  } else {
    error.textContent = "Contraseña incorrecta 💔";
  }
}

function showLetter() { setScreenVisible('letterScreen'); }
function goBack() { setScreenVisible('menuScreen'); }

// Event listeners (separados del HTML)
document.addEventListener('DOMContentLoaded', () => {
  // enviar el formulario con Enter
  const form = document.getElementById('passwordForm');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    checkPassword();
  });

  // botones
  document.getElementById('btnShowLetter').addEventListener('click', showLetter);
  document.getElementById('btnBack').addEventListener('click', goBack);
});