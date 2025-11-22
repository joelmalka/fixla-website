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
     * Scroll to Top Button (optional enhancement)
     */
    function initScrollToTop() {
        // Create button element
        const scrollBtn = document.createElement('button');
        scrollBtn.innerHTML = '↑';
        scrollBtn.className = 'scroll-to-top';
        scrollBtn.setAttribute('aria-label', 'Scroll to top');
        scrollBtn.style.cssText = `
            position: fixed;
            bottom: 30px;
            right: 30px;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background-color: var(--color-primary);
            color: white;
            border: none;
            font-size: 24px;
            cursor: pointer;
            opacity: 0;
            transition: opacity 0.3s, transform 0.3s;
            z-index: 999;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        `;

        document.body.appendChild(scrollBtn);

        // Show/hide button on scroll
        window.addEventListener('scroll', function() {
            if (window.scrollY > 300) {
                scrollBtn.style.opacity = '1';
                scrollBtn.style.transform = 'scale(1)';
            } else {
                scrollBtn.style.opacity = '0';
                scrollBtn.style.transform = 'scale(0.8)';
            }
        });

        // Scroll to top on click
        scrollBtn.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });

        // Hover effect
        scrollBtn.addEventListener('mouseenter', function() {
            this.style.backgroundColor = 'var(--color-primary-dark)';
        });

        scrollBtn.addEventListener('mouseleave', function() {
            this.style.backgroundColor = 'var(--color-primary)';
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
     * Initialize all functions when DOM is ready
     */
    function init() {
        initMobileMenu();
        initSmoothScroll();
        initFormHandler();
        setActiveNavLink();
        initScrollToTop();

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
