// ========================================
// script.js - Rutas Accesibles (versión optimizada)
// Mejoras: throttle, offset dinámico, cierre fuera del menú,
// detección precisa de secciones, respeto por prefers-reduced-motion
// ========================================

document.addEventListener('DOMContentLoaded', function() {

    // --- Elementos del DOM ---
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
    const navbarCollapse = document.querySelector('.navbar-collapse');
    const toggler = document.querySelector('.navbar-toggler');
    const header = document.querySelector('header .navbar');
    const sections = document.querySelectorAll('section[id]');
    const navItems = document.querySelectorAll('.navbar-nav .nav-link');
    const menuToggle = document.querySelector('.navbar-toggler');

    // --- 1. Cierre del menú móvil ---

    // Al hacer clic en un enlace del menú, se cierra (si está abierto)
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            if (window.innerWidth < 992 && navbarCollapse.classList.contains('show')) {
                toggler.click();
            }
        });
    });

    // Cerrar el menú al hacer clic fuera de él (en móviles)
    document.addEventListener('click', function(e) {
        if (window.innerWidth < 992) {
            const isClickInsideNav = header.contains(e.target);
            if (!isClickInsideNav && navbarCollapse.classList.contains('show')) {
                toggler.click();
            }
        }
    });

    // Prevenir que el click dentro del menú lo cierre (excepto en enlaces)
    // ya manejado arriba

    // --- 2. Detección de sección activa con throttle y offset dinámico ---

    let headerHeight = 0;
    let ticking = false;

    // Función para obtener la altura real del header (incluyendo padding y border)
    function updateHeaderHeight() {
        if (header) {
            headerHeight = header.offsetHeight + 20; // 20px de margen extra
        }
    }
    updateHeaderHeight();

    // Actualizar altura al redimensionar (por si cambia el layout)
    window.addEventListener('resize', function() {
        updateHeaderHeight();
        // también forzar una actualización de la sección activa
        if (!ticking) {
            window.requestAnimationFrame(function() {
                highlightNavOnScroll();
                ticking = false;
            });
            ticking = true;
        }
    });

    // Función para resaltar el enlace según la sección visible
    function highlightNavOnScroll() {
        const scrollY = window.pageYOffset;
        let currentSectionId = '';

        // Usamos getBoundingClientRect para mayor precisión
        sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            // Consideramos que la sección está activa si su parte superior está en la zona visible
            // y si su parte inferior no está por encima del header
            const sectionTop = rect.top + window.pageYOffset; // posición absoluta
            const sectionBottom = sectionTop + section.offsetHeight;

            // Ajustamos el offset considerando el header fijo
            const topThreshold = headerHeight; // lo que ocupa el header
            const bottomThreshold = window.innerHeight / 2; // mitad de la pantalla

            // Si la sección está visible (top <= viewport + header) y su bottom está más allá del header
            if (rect.top <= window.innerHeight - bottomThreshold && rect.bottom >= headerHeight) {
                currentSectionId = section.getAttribute('id');
            }
        });

        // Actualizar clases de los enlaces
        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('href') === '#' + currentSectionId) {
                item.classList.add('active');
            }
        });
    }

    // Función con throttle usando requestAnimationFrame
    function onScroll() {
        if (!ticking) {
            window.requestAnimationFrame(function() {
                highlightNavOnScroll();
                ticking = false;
            });
            ticking = true;
        }
    }

    // Escuchar scroll con throttle
    window.addEventListener('scroll', onScroll);

    // Ejecutar una vez al cargar para marcar la sección inicial
    setTimeout(highlightNavOnScroll, 100); // pequeño retraso para asegurar el layout

    // --- 3. Botón "Volver arriba" (opcional pero útil) ---

    // Crear el botón dinámicamente si no existe
    let backToTopBtn = document.getElementById('backToTop');
    if (!backToTopBtn) {
        backToTopBtn = document.createElement('button');
        backToTopBtn.id = 'backToTop';
        backToTopBtn.innerHTML = '⬆';
        backToTopBtn.setAttribute('aria-label', 'Volver arriba');
        backToTopBtn.style.cssText = `
            position: fixed;
            bottom: 30px;
            right: 30px;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background: var(--terracota, #c9693e);
            color: white;
            border: none;
            font-size: 24px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            cursor: pointer;
            z-index: 999;
            display: none;
            transition: opacity 0.3s, transform 0.3s;
            opacity: 0.8;
            font-family: 'Inter', sans-serif;
            line-height: 1;
        `;
        document.body.appendChild(backToTopBtn);

        backToTopBtn.addEventListener('click', function() {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        // Mostrar/ocultar según scroll
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 400) {
                backToTopBtn.style.display = 'block';
                // Añadir un pequeño fade in
                backToTopBtn.style.opacity = '0.8';
            } else {
                backToTopBtn.style.opacity = '0';
                setTimeout(() => {
                    if (window.pageYOffset <= 400) backToTopBtn.style.display = 'none';
                }, 300);
            }
        });

        // Respetar prefers-reduced-motion
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        if (prefersReducedMotion.matches) {
            backToTopBtn.style.transition = 'none';
        }
    }

    // --- 4. Mejora de accesibilidad: manejar el foco al cerrar el menú ---

    // Cuando se cierra el menú (click en enlace o fuera), devolver el foco al toggler
    const closeMenuAndFocus = function() {
        if (navbarCollapse.classList.contains('show')) {
            // No forzamos el foco aquí porque podría ser molesto, pero podemos hacerlo opcional
        }
    };

    // Podríamos agregar un evento al toggler para que cuando se abra, se enfoque el primer enlace
    menuToggle.addEventListener('click', function() {
        if (navbarCollapse.classList.contains('show')) {
            // El menú se abrió, enfocar el primer enlace (opcional)
            // const firstLink = navLinks[0];
            // if (firstLink) setTimeout(() => firstLink.focus(), 100);
        }
    });

    // --- 5. Log en consola (útil para depuración) ---
    console.log('🚀 Rutas Accesibles: JS mejorado cargado correctamente.');
    console.log(`📱 Dispositivo: ${window.innerWidth < 992 ? 'Móvil' : 'Escritorio'}`);

    // --- 6. (Opcional) Detectar cambios de orientación o tamaño ---
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            updateHeaderHeight();
            highlightNavOnScroll();
            console.log(`🔄 Resize: ${window.innerWidth}px`);
        }, 250);
    });

}); // Fin DOMContentLoaded