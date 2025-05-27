document.addEventListener('DOMContentLoaded', () => {
    const navToggler = document.querySelector('.nav-toggler');
    const navMenu = document.querySelector('.nav-menu');

    if (navToggler && navMenu) {
        navToggler.addEventListener('click', () => {
            navToggler.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }

    // Optional: Close the menu when a link is clicked (useful for single-page applications)
    const navLinks = document.querySelectorAll('.nav-item a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navMenu.classList.contains('active')) {
                navToggler.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
    });
});
