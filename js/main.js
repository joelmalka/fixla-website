/**
 * Fixla Website JavaScript
 * Handles mobile navigation and interactive features
 */

(function() {
    'use strict';

    /**
     * Mobile Menu Toggle
     */
    function initMobileMenu() {
        const mobileToggle = document.querySelector('.mobile-menu-toggle');
        const navMenu = document.querySelector('.nav-menu');

        console.log('Mobile menu init:', { mobileToggle, navMenu });

        if (!mobileToggle || !navMenu) {
            console.error('Mobile menu elements not found!');
            return;
        }

        mobileToggle.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Menu clicked!');
            this.classList.toggle('active');
            navMenu.classList.toggle('active');
            console.log('Menu is now:', navMenu.classList.contains('active') ? 'OPEN' : 'CLOSED');
        });

        // Close menu when clicking on a nav link
        const navLinks = navMenu.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                mobileToggle.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            const isClickInsideNav = navMenu.contains(event.target);
            const isClickOnToggle = mobileToggle.contains(event.target);

            if (!isClickInsideNav && !isClickOnToggle && navMenu.classList.contains('active')) {
                mobileToggle.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
    }

    /**
     * Smooth Scroll for Anchor Links
     */
    function initSmoothScroll() {
        const anchors = document.querySelectorAll('a[href^="#"]');

        anchors.forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const href = this.getAttribute('href');

                // Skip if it's just "#"
                if (href === '#') {
                    e.preventDefault();
                    return;
                }

                const target = document.querySelector(href);

                if (target) {
                    e.preventDefault();
                    const offsetTop = target.offsetTop - 80; // Account for fixed navbar

                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    /**
     * Form Submission Handler
     */
    function initFormHandler() {
        const forms = document.querySelectorAll('form');

        forms.forEach(form => {
            form.addEventListener('submit', function(e) {
                // If form has action attribute, let it submit normally
                if (this.hasAttribute('action')) {
                    return;
                }

                // Otherwise prevent default and show message
                e.preventDefault();

                const formData = new FormData(this);
                const data = {};

                formData.forEach((value, key) => {
                    data[key] = value;
                });

                console.log('Form submission:', data);

                // Show success message
                alert('Kiitos viestistäsi! Otamme sinuun yhteyttä pian.');

                // Reset form
                this.reset();
            });
        });
    }

    /**
     * Active Nav Link Based on Current Page
     */
    function setActiveNavLink() {
        const currentPath = window.location.pathname;
        const navLinks = document.querySelectorAll('.nav-menu a');

        navLinks.forEach(link => {
            const linkPath = new URL(link.href).pathname;

            // Remove active class first
            link.classList.remove('active');

            // Add active class if paths match
            if (currentPath === linkPath ||
                (currentPath.endsWith('/') && linkPath.endsWith('index.html')) ||
                (currentPath === '/' && linkPath.endsWith('index.html'))) {
                link.classList.add('active');
            }
        });
    }


    /**
     * Lazy Loading Images (performance enhancement)
     */
    function initLazyLoading() {
        const images = document.querySelectorAll('img[data-src]');

        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    observer.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));
    }

    /**
     * Scroll Reveal Animations
     */
    function initScrollReveal() {
        const revealElements = document.querySelectorAll('.scroll-reveal, .scroll-reveal-left, .scroll-reveal-right, .scroll-reveal-scale');

        if (revealElements.length === 0) return;

        const observerOptions = {
            root: null,
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    // Optional: stop observing after reveal (one-time animation)
                    // observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        revealElements.forEach(element => {
            observer.observe(element);
        });
    }

    /**
     * Initialize all functions when DOM is ready
     */
    function init() {
        initMobileMenu();
        initSmoothScroll();
        initFormHandler();
        setActiveNavLink();
        initScrollReveal();

        // Only init lazy loading if images with data-src exist
        if (document.querySelectorAll('img[data-src]').length > 0) {
            initLazyLoading();
        }
    }

    // Run init when DOM is fully loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
