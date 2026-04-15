/* ============================================
   PAWS & CO. — Playful Interactive Script
   Hero slider · scroll reveal · filters · cart
   accordion · PDP gallery · counter · testimonials
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

    /* ── Scroll Reveal (IntersectionObserver + fallback) ── */
    const revealElements = document.querySelectorAll('.reveal-up');

    if ('IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
        revealElements.forEach(el => revealObserver.observe(el));
    }

    function revealOnScroll() {
        revealElements.forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.top < window.innerHeight - 40 && rect.bottom > 0) {
                el.classList.add('visible');
            }
        });
    }
    window.addEventListener('scroll', revealOnScroll, { passive: true });
    setTimeout(revealOnScroll, 100);

    /* ── Hero Slider ── */
    const slider = document.getElementById('heroSlider');
    if (slider) {
        const slides = slider.querySelectorAll('.slide');
        const dots = document.querySelectorAll('#sliderDots .dot');
        const prevBtn = document.getElementById('slidePrev');
        const nextBtn = document.getElementById('slideNext');
        let current = 0;
        let autoplay;

        function goTo(i) {
            slides[current].classList.remove('active');
            dots[current].classList.remove('active');
            current = (i + slides.length) % slides.length;
            slides[current].classList.add('active');
            dots[current].classList.add('active');
        }

        function next() { goTo(current + 1); }
        function prev() { goTo(current - 1); }

        if (nextBtn) nextBtn.addEventListener('click', () => { next(); resetAutoplay(); });
        if (prevBtn) prevBtn.addEventListener('click', () => { prev(); resetAutoplay(); });

        dots.forEach(dot => {
            dot.addEventListener('click', () => {
                goTo(parseInt(dot.dataset.slide));
                resetAutoplay();
            });
        });

        function startAutoplay() { autoplay = setInterval(next, 6000); }
        function resetAutoplay() { clearInterval(autoplay); startAutoplay(); }
        startAutoplay();

        // Pause on hover
        slider.addEventListener('mouseenter', () => clearInterval(autoplay));
        slider.addEventListener('mouseleave', startAutoplay);

        // Swipe support
        let touchStartX = 0;
        slider.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
        slider.addEventListener('touchend', (e) => {
            const dx = e.changedTouches[0].clientX - touchStartX;
            if (Math.abs(dx) > 50) { dx < 0 ? next() : prev(); resetAutoplay(); }
        });

        // Keyboard
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight') { next(); resetAutoplay(); }
            if (e.key === 'ArrowLeft') { prev(); resetAutoplay(); }
        });
    }

    /* ── Product Filters ── */
    const filterPills = document.querySelectorAll('.filter-pill');
    const products = document.querySelectorAll('.bestsellers .product');

    filterPills.forEach(pill => {
        pill.addEventListener('click', () => {
            filterPills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            const filter = pill.dataset.filter;

            products.forEach((product, i) => {
                const cat = product.dataset.category;
                const show = filter === 'all' || cat === filter;

                if (show) {
                    product.classList.remove('hidden');
                    product.style.transitionDelay = `${i * 0.04}s`;
                    product.style.opacity = '0';
                    product.style.transform = 'translateY(20px)';
                    requestAnimationFrame(() => {
                        product.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
                        product.style.opacity = '1';
                        product.style.transform = 'translateY(0)';
                    });
                } else {
                    product.classList.add('hidden');
                }
            });
        });
    });

    /* ── Counter Animation ── */
    const statNumbers = document.querySelectorAll('.stat-num');
    if (statNumbers.length && 'IntersectionObserver' in window) {
        const counterObs = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    const target = parseInt(el.dataset.count);
                    animateCounter(el, target);
                    counterObs.unobserve(el);
                }
            });
        }, { threshold: 0.4 });
        statNumbers.forEach(el => counterObs.observe(el));
    }

    function animateCounter(el, target) {
        if (target === 0) { el.textContent = '0'; return; }
        const duration = 1800;
        const start = Date.now();
        function update() {
            const elapsed = Date.now() - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const value = Math.round(target * eased);
            el.textContent = value >= 1000 ? value.toLocaleString() : value;
            if (progress < 1) requestAnimationFrame(update);
        }
        update();
    }

    /* ── Testimonials Carousel ── */
    const track = document.getElementById('testimonialTrack');
    const tPrev = document.getElementById('tPrev');
    const tNext = document.getElementById('tNext');

    if (track && tPrev && tNext) {
        const scrollAmt = () => {
            const slide = track.querySelector('.testimonial');
            return slide ? slide.offsetWidth + 24 : 360;
        };

        tPrev.addEventListener('click', () => track.scrollBy({ left: -scrollAmt(), behavior: 'smooth' }));
        tNext.addEventListener('click', () => track.scrollBy({ left: scrollAmt(), behavior: 'smooth' }));

        let auto = setInterval(() => {
            const max = track.scrollWidth - track.clientWidth;
            if (track.scrollLeft >= max - 10) track.scrollTo({ left: 0, behavior: 'smooth' });
            else track.scrollBy({ left: scrollAmt(), behavior: 'smooth' });
        }, 5500);

        track.addEventListener('mouseenter', () => clearInterval(auto));
    }

    /* ── Cart Drawer ── */
    const cartBtn = document.getElementById('cartBtn');
    const cartDrawer = document.getElementById('cartDrawer');
    const cartOverlay = document.getElementById('cartOverlay');
    const cartClose = document.getElementById('cartClose');

    function openCart() {
        if (!cartDrawer) return;
        cartDrawer.classList.add('open');
        cartOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    function closeCart() {
        if (!cartDrawer) return;
        cartDrawer.classList.remove('open');
        cartOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    if (cartBtn) cartBtn.addEventListener('click', openCart);
    if (cartClose) cartClose.addEventListener('click', closeCart);
    if (cartOverlay) cartOverlay.addEventListener('click', closeCart);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeCart(); });

    /* ── Quick Add to Cart ── */
    const quickAdds = document.querySelectorAll('.quick-add');
    const cartCount = document.querySelector('.cart-count');
    let cartNum = 2;

    quickAdds.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            cartNum++;
            if (cartCount) {
                cartCount.textContent = cartNum;
                cartCount.style.animation = 'none';
                requestAnimationFrame(() => {
                    cartCount.style.animation = 'pulse 0.4s ease';
                });
            }
            const original = btn.innerHTML;
            btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M5 12l5 5L20 7"/></svg>';
            btn.style.background = 'var(--mint)';
            btn.style.color = 'var(--ink)';
            setTimeout(() => {
                btn.innerHTML = original;
                btn.style.background = '';
                btn.style.color = '';
            }, 1400);
        });
    });

    // Inject pulse keyframe
    if (!document.getElementById('paws-kf')) {
        const style = document.createElement('style');
        style.id = 'paws-kf';
        style.textContent = `@keyframes pulse{0%{transform:scale(1)}50%{transform:scale(1.35)}100%{transform:scale(1)}}`;
        document.head.appendChild(style);
    }

    /* ── Smooth anchor scroll ── */
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', (e) => {
            const href = a.getAttribute('href');
            if (href === '#' || href.length < 2) return;
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                window.scrollTo({ top: target.offsetTop - 80, behavior: 'smooth' });
            }
        });
    });

    /* ── Newsletter ── */
    document.querySelectorAll('.newsletter-form').forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = form.querySelector('button');
            const input = form.querySelector('input');
            if (btn) {
                const original = btn.innerHTML;
                btn.innerHTML = 'Welcome aboard! 🎉';
                if (input) input.value = '';
                setTimeout(() => { btn.innerHTML = original; }, 2800);
            }
        });
    });

    /* ── PDP Gallery ── */
    const galMain = document.getElementById('galleryMain');
    const galThumbs = document.querySelectorAll('#galleryThumbs .thumb');
    galThumbs.forEach(thumb => {
        thumb.addEventListener('click', () => {
            galThumbs.forEach(t => t.classList.remove('active'));
            thumb.classList.add('active');
            if (galMain) {
                galMain.style.opacity = '0';
                setTimeout(() => {
                    galMain.src = thumb.dataset.img;
                    galMain.style.opacity = '1';
                }, 150);
            }
        });
    });

    /* ── PDP Option Groups ── */
    document.querySelectorAll('.option-buttons').forEach(group => {
        const groupName = group.dataset.group;
        const targetEl = document.getElementById(`selected${groupName.charAt(0).toUpperCase() + groupName.slice(1)}`);

        group.querySelectorAll('.opt').forEach(opt => {
            opt.addEventListener('click', () => {
                group.querySelectorAll('.opt').forEach(o => o.classList.remove('active'));
                opt.classList.add('active');
                if (targetEl) targetEl.textContent = opt.textContent;
            });
        });
    });

    /* ── PDP Quantity ── */
    const qtyValue = document.getElementById('qtyValue');
    const qtyUp = document.getElementById('qtyUp');
    const qtyDown = document.getElementById('qtyDown');

    if (qtyValue && qtyUp && qtyDown) {
        let qty = 1;
        qtyUp.addEventListener('click', () => { qty++; qtyValue.textContent = qty; });
        qtyDown.addEventListener('click', () => { if (qty > 1) { qty--; qtyValue.textContent = qty; } });
    }

    /* ── Add to cart (PDP) ── */
    const addToCartBtn = document.getElementById('addToCartBtn');
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', () => {
            cartNum++;
            if (cartCount) cartCount.textContent = cartNum;
            const original = addToCartBtn.innerHTML;
            addToCartBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M5 12l5 5L20 7"/></svg> Added!';
            addToCartBtn.style.background = 'var(--mint)';
            addToCartBtn.style.color = 'var(--ink)';
            setTimeout(() => openCart(), 500);
            setTimeout(() => {
                addToCartBtn.innerHTML = original;
                addToCartBtn.style.background = '';
                addToCartBtn.style.color = '';
            }, 2200);
        });
    }

    /* ── PDP Accordion ── */
    document.querySelectorAll('.acc-header').forEach(header => {
        header.addEventListener('click', () => {
            const item = header.closest('.acc-item');
            item.classList.toggle('open');
        });
    });

    /* ── Wishlist heart toggle ── */
    document.querySelectorAll('.wishlist').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            btn.classList.toggle('active');
            if (btn.classList.contains('active')) {
                btn.style.background = 'var(--pink)';
                btn.style.color = 'var(--white)';
            } else {
                btn.style.background = '';
                btn.style.color = '';
            }
        });
    });

    /* ── Product card tilt ── */
    document.querySelectorAll('.product').forEach(card => {
        const img = card.querySelector('.product-image img');
        if (!img) return;
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;
            img.style.transform = `scale(1.08) translate(${x * 10}px, ${y * 10}px)`;
        });
        card.addEventListener('mouseleave', () => { img.style.transform = ''; });
    });

});
