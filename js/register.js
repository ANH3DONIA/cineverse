document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('register-form');
  const togglePassword = document.getElementById('toggle-password');
  const passwordInput = document.getElementById('password');
  const submitBtn = document.getElementById('submit-btn');
  const successMessage = document.getElementById('success-message');

  if (togglePassword && passwordInput) {
    togglePassword.addEventListener('click', () => {
      const isPassword = passwordInput.type === 'password';
      passwordInput.type = isPassword ? 'text' : 'password';
      togglePassword.setAttribute('aria-pressed', String(isPassword));
      togglePassword.setAttribute(
        'aria-label',
        isPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'
      );
      togglePassword.textContent = isPassword ? 'Ocultar' : 'Ver';
    });
  }

  const birthdateInput = document.getElementById('birthdate');
  if (birthdateInput) {
    const today = new Date();
    birthdateInput.max = today.toISOString().split('T')[0];

    birthdateInput.addEventListener('change', () => {
      const birthDate = new Date(birthdateInput.value);
      const ageDiff = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      let age = ageDiff;
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      if (age < 13) {
        birthdateInput.setCustomValidity('Debes tener al menos 13 años para registrarte.');
      } else {
        birthdateInput.setCustomValidity('');
      }
    });
  }

  const syncAria = (el) => {
    if (el.matches && el.checkValidity !== undefined) {
      el.setAttribute('aria-invalid', el.matches(':user-invalid') ? 'true' : 'false');
    }
  };

  document.addEventListener('blur', (e) => syncAria(e.target), true);
  document.addEventListener('input', (e) => {
    if (e.target.hasAttribute('aria-invalid')) syncAria(e.target);
  });

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = 'Creando cuenta...';

      try {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        data.terms = formData.has('terms');

        const response = await fetch('/api/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.success) {
          form.hidden = true;
          successMessage.hidden = false;
        } else {
          alert('Error: ' + ((result.errors && result.errors.join('\n')) || 'Error desconocido'));
          submitBtn.disabled = false;
          submitBtn.textContent = 'Crear Cuenta';
        }
      } catch (error) {
        alert('Error de conexión. Intenta de nuevo.');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Crear Cuenta';
      }
    });
  }
});
