// ===================================
// COLEGIO SAN MIGUEL - MAIN.JS
// ===================================

// ===== NAVBAR MOBILE TOGGLE =====
const navToggle = document.getElementById('navToggle');
const navMenu   = document.getElementById('navMenu');

if (navToggle) {
    navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('open');
    });
}

// Cerrar menú al hacer click fuera
document.addEventListener('click', (e) => {
    if (navMenu && !navMenu.contains(e.target) && !navToggle.contains(e.target)) {
        navMenu.classList.remove('open');
    }
});

// ===== MARCAR LINK ACTIVO EN NAVBAR =====
const currentPage = window.location.pathname.split('/').pop();
document.querySelectorAll('.nav-menu a').forEach(link => {
    const linkPage = link.getAttribute('href').split('/').pop();
    if (linkPage === currentPage || (currentPage === '' && linkPage === 'index.html')) {
        link.classList.add('active');
    }
});

// ===== FORMULARIO CONTACTO =====
const formContacto = document.getElementById('formContacto');
if (formContacto) {
    formContacto.addEventListener('submit', async (e) => {
        e.preventDefault();

        const btn     = formContacto.querySelector('.btn-submit');
        const success = document.getElementById('formSuccess');
        const error   = document.getElementById('formError');

        btn.textContent = 'Enviando...';
        btn.disabled = true;

        const data = {
            nombre:   formContacto.nombre.value,
            email:    formContacto.email.value,
            telefono: formContacto.telefono?.value || '',
            asunto:   formContacto.asunto.value,
            mensaje:  formContacto.mensaje.value
        };

        try {
            const res = await fetch('/api/contactos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            const result = await res.json();

            if (result.success) {
                success.style.display = 'block';
                error.style.display   = 'none';
                formContacto.reset();
            } else {
                throw new Error(result.error);
            }
        } catch (err) {
            error.style.display   = 'block';
            error.textContent     = '❌ Error al enviar. Inténtalo de nuevo.';
            success.style.display = 'none';
        } finally {
            btn.textContent = 'Enviar Mensaje';
            btn.disabled = false;
        }
    });
}

// ===== FORMULARIO ADMISIÓN =====
const formAdmision = document.getElementById('formAdmision');
if (formAdmision) {
    formAdmision.addEventListener('submit', async (e) => {
        e.preventDefault();

        const btn     = formAdmision.querySelector('.btn-submit');
        const success = document.getElementById('admisionSuccess');
        const error   = document.getElementById('admisionError');

        btn.textContent = 'Enviando...';
        btn.disabled = true;

        const data = {
            nombre_estudiante:    formAdmision.nombre_estudiante.value,
            apellido_estudiante:  formAdmision.apellido_estudiante.value,
            fecha_nacimiento:     formAdmision.fecha_nacimiento.value,
            email_padre:          formAdmision.email_padre.value,
            telefono_padre:       formAdmision.telefono_padre.value,
            grado_interes:        formAdmision.grado_interes.value
        };

        try {
            const res = await fetch('/api/solicitudes-admision', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            const result = await res.json();

            if (result.success) {
                success.style.display = 'block';
                success.innerHTML = `✅ ${result.message}<br><strong>N° Solicitud: ${result.numero_solicitud}</strong>`;
                error.style.display   = 'none';
                formAdmision.reset();
            } else {
                throw new Error(result.error);
            }
        } catch (err) {
            error.style.display   = 'block';
            error.textContent     = '❌ Error al enviar. Inténtalo de nuevo.';
            success.style.display = 'none';
        } finally {
            btn.textContent = 'Enviar Solicitud';
            btn.disabled = false;
        }
    });
}

// ===== ANIMACIÓN AL HACER SCROLL =====
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity  = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.noticia-card, .evento-item, .card, .acceso-card').forEach(el => {
    el.style.opacity    = '0';
    el.style.transform  = 'translateY(20px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(el);
});

// ===== AÑO ACTUAL EN FOOTER =====
const yearEl = document.getElementById('currentYear');
if (yearEl) yearEl.textContent = new Date().getFullYear();