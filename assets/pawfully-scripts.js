/**
 * pawfully-scripts.js — Paws & Co. Interactive Layer
 * Loaded as type="module" defer — executes after DOM is ready
 * All selectors use .paws-* namespace to avoid Horizon conflicts
 */

// ─── 1. SCROLL REVEAL ────────────────────────────────────────────────────────
function initScrollReveal() {
  const revealEls = document.querySelectorAll('.paws-reveal-up');
  if (!revealEls.length) return;

  // Opt into reveal animation — CSS keeps elements VISIBLE unless this flag is set.
  // That way, if the script fails for any reason, sections still render.
  if (!('IntersectionObserver' in window)) {
    revealEls.forEach((el) => el.classList.add('visible'));
    return;
  }

  document.documentElement.setAttribute('data-paws-reveal-ready', '');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.05, rootMargin: '0px 0px -20px 0px' }
  );

  revealEls.forEach((el) => {
    // If element is already in viewport on load, mark it visible immediately
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      el.classList.add('visible');
    } else {
      observer.observe(el);
    }
  });
}

// ─── 2. HERO SLIDER ──────────────────────────────────────────────────────────
function initHeroSlider() {
  const sliders = document.querySelectorAll('.paws-slider');
  if (!sliders.length) return;

  sliders.forEach((slider) => {
    const slides = slider.querySelectorAll('.paws-slide');
    const dots = slider.querySelectorAll('.paws-dot');
    const prevBtn = slider.querySelector('.paws-slider-prev');
    const nextBtn = slider.querySelector('.paws-slider-next');
    if (!slides.length) return;

    let current = 0;
    let autoTimer = null;
    let touchStartX = 0;
    let touchEndX = 0;

    function goTo(index) {
      slides[current].classList.remove('active');
      slides[current].setAttribute('aria-hidden', 'true');
      if (dots[current]) dots[current].classList.remove('active');

      current = (index + slides.length) % slides.length;

      slides[current].classList.add('active');
      slides[current].setAttribute('aria-hidden', 'false');
      if (dots[current]) dots[current].classList.add('active');
    }

    function next() { goTo(current + 1); }
    function prev() { goTo(current - 1); }

    function startAuto() {
      stopAuto();
      autoTimer = setInterval(next, 6000);
    }

    function stopAuto() {
      if (autoTimer) { clearInterval(autoTimer); autoTimer = null; }
    }

    // Init first slide
    slides[0].classList.add('active');
    slides[0].setAttribute('aria-hidden', 'false');
    if (dots[0]) dots[0].classList.add('active');
    slides.forEach((s, i) => { if (i > 0) s.setAttribute('aria-hidden', 'true'); });

    // Controls
    if (nextBtn) nextBtn.addEventListener('click', () => { next(); startAuto(); });
    if (prevBtn) prevBtn.addEventListener('click', () => { prev(); startAuto(); });

    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => { goTo(i); startAuto(); });
    });

    // Keyboard
    slider.setAttribute('tabindex', '0');
    slider.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { next(); startAuto(); }
      if (e.key === 'ArrowLeft') { prev(); startAuto(); }
    });

    // Touch swipe
    slider.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    slider.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 50) {
        diff > 0 ? next() : prev();
        startAuto();
      }
    }, { passive: true });

    // Pause on hover
    slider.addEventListener('mouseenter', stopAuto);
    slider.addEventListener('mouseleave', startAuto);

    startAuto();
  });
}

// ─── 3. PRODUCT FILTER PILLS (collection-tab switcher) ───────────────────────
function initFilterPills() {
  document.querySelectorAll('.paws-bestsellers').forEach((section) => {
    const pills = section.querySelectorAll('[data-paws-filter]');
    const panels = section.querySelectorAll('[data-paws-panel]');
    if (!pills.length || !panels.length) return;

    pills.forEach((pill) => {
      pill.addEventListener('click', () => {
        const key = pill.dataset.pawsFilter;

        pills.forEach((p) => p.classList.toggle('active', p === pill));

        panels.forEach((panel) => {
          const match = panel.dataset.pawsPanel === key;
          if (match) {
            panel.classList.add('active');
            // Fade the products in
            panel.querySelectorAll('.paws-product').forEach((p, i) => {
              p.style.opacity = '0';
              p.style.transform = 'translateY(12px)';
              setTimeout(() => {
                p.style.opacity = '1';
                p.style.transform = 'translateY(0)';
              }, 40 + i * 25);
            });
          } else {
            panel.classList.remove('active');
          }
        });
      });
    });
  });

  // Legacy shop sidebar filter pills (non-bestsellers) — simple category toggle
  document.querySelectorAll('.paws-shop-main .paws-filter-bar').forEach((bar) => {
    const pills = bar.querySelectorAll('.paws-filter-pill');
    const grid = bar.closest('.paws-shop-main')?.querySelector('.paws-shop-grid');
    if (!grid || !pills.length) return;
    const products = grid.querySelectorAll('.paws-product');

    pills.forEach((pill) => {
      pill.addEventListener('click', () => {
        pills.forEach((p) => p.classList.remove('active'));
        pill.classList.add('active');
        const filter = pill.dataset.filter || 'all';
        products.forEach((product) => {
          const cat = product.dataset.category || '';
          product.style.display = filter === 'all' || cat === filter ? '' : 'none';
        });
      });
    });
  });
}

// ─── 4. COUNTER ANIMATION ────────────────────────────────────────────────────
function initCounters() {
  const counters = document.querySelectorAll('[data-paws-count]');
  if (!counters.length) return;

  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

  function animateCounter(el) {
    const target = parseFloat(el.dataset.pawsCount);
    const suffix = el.dataset.pawsSuffix || '';
    const duration = 1800;
    const start = performance.now();

    function step(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(progress);
      const value = target * eased;
      el.textContent = (Number.isInteger(target) ? Math.floor(value) : value.toFixed(1)) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach((el) => observer.observe(el));
}

// ─── 5. TESTIMONIALS CAROUSEL ────────────────────────────────────────────────
function initTestimonialsCarousel() {
  const tracks = document.querySelectorAll('.paws-testimonial-track');
  if (!tracks.length) return;

  tracks.forEach((track) => {
    const container = track.closest('.paws-testimonials');
    if (!container) return;

    const prevBtn = container.querySelector('.paws-t-prev');
    const nextBtn = container.querySelector('.paws-t-next');
    const cards = track.querySelectorAll('.paws-testimonial');
    if (!cards.length) return;

    let current = 0;

    function scrollTo(index) {
      current = Math.max(0, Math.min(index, cards.length - 1));
      cards[current].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
    }

    if (prevBtn) prevBtn.addEventListener('click', () => scrollTo(current - 1));
    if (nextBtn) nextBtn.addEventListener('click', () => scrollTo(current + 1));

    // Auto-scroll every 5s
    let autoTimer = setInterval(() => {
      current = (current + 1) % cards.length;
      scrollTo(current);
    }, 5000);

    container.addEventListener('mouseenter', () => clearInterval(autoTimer));
    container.addEventListener('mouseleave', () => {
      autoTimer = setInterval(() => {
        current = (current + 1) % cards.length;
        scrollTo(current);
      }, 5000);
    });
  });
}

// ─── 6. CART DRAWER — open/close + AJAX qty/remove ───────────────────────────
function initCartDrawer() {
  const drawer = document.querySelector('.paws-cart-drawer');
  const overlay = document.querySelector('.paws-cart-overlay');
  if (!drawer || !overlay) return;

  const moneyFormat = (window.Shopify && window.Shopify.money_format) || '${{amount}}';

  function formatMoney(cents) {
    // Simple money formatter (matches Shopify's default $X.XX)
    const value = (cents / 100).toFixed(2);
    return moneyFormat.replace(/\{\{\s*amount\s*\}\}/, value).replace(/\{\{[^}]+\}\}/g, value);
  }

  function openCart() {
    drawer.classList.add('open');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    drawer.setAttribute('aria-hidden', 'false');
  }

  function closeCart() {
    drawer.classList.remove('open');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
    drawer.setAttribute('aria-hidden', 'true');
  }

  async function refreshCart() {
    // Fetch the whole paws-cart-drawer via section rendering API; fallback to page reload.
    try {
      const res = await fetch('/?section_id=header', { headers: { 'X-Requested-With': 'XMLHttpRequest' } });
      if (res.ok) {
        const html = await res.text();
        const tmp = document.createElement('div');
        tmp.innerHTML = html;
        const newDrawer = tmp.querySelector('.paws-cart-drawer');
        const newCountBadges = tmp.querySelectorAll('[data-cart-count]');
        if (newDrawer) {
          drawer.innerHTML = newDrawer.innerHTML;
          rewireCart();
        }
        // Update all count badges
        const current = await fetch('/cart.js').then((r) => r.json());
        document.querySelectorAll('[data-cart-count]').forEach((el) => {
          el.textContent = current.item_count;
          el.style.display = current.item_count > 0 ? '' : 'none';
        });
        return;
      }
    } catch (_) {
      /* fall through to reload */
    }
    window.location.reload();
  }

  async function changeQuantity(line, qty) {
    try {
      const res = await fetch('/cart/change.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ line, quantity: qty }),
      });
      if (!res.ok) throw new Error('bad');
      await refreshCart();
    } catch (_) {
      window.location.reload();
    }
  }

  function rewireCart() {
    drawer.querySelectorAll('[data-paws-cart-close]').forEach((b) => {
      b.addEventListener('click', closeCart);
    });
    drawer.querySelectorAll('[data-paws-qty]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const line = parseInt(btn.dataset.line, 10);
        const row = btn.closest('.paws-cart-item');
        const display = row?.querySelector('[data-paws-qty-value]');
        const current = parseInt(display?.textContent || '1', 10);
        const direction = btn.dataset.pawsQty === 'plus' ? 1 : -1;
        const next = Math.max(0, current + direction);
        btn.disabled = true;
        changeQuantity(line, next);
      });
    });
    drawer.querySelectorAll('[data-paws-cart-remove]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const line = parseInt(btn.dataset.line, 10);
        btn.disabled = true;
        changeQuantity(line, 0);
      });
    });
  }

  // Header triggers
  document.querySelectorAll('[data-paws-cart-open]').forEach((btn) => {
    btn.addEventListener('click', openCart);
  });
  document.querySelectorAll('[data-paws-cart-close]').forEach((btn) => {
    btn.addEventListener('click', closeCart);
  });
  overlay.addEventListener('click', closeCart);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('open')) closeCart();
  });

  rewireCart();

  // Expose for other scripts (PDP add-to-cart opens the drawer after success)
  window.pawsOpenCart = openCart;
  window.pawsCloseCart = closeCart;
  window.pawsRefreshCart = refreshCart;

  // When any form submits to /cart/add, intercept and refresh drawer instead of reloading
  document.addEventListener('submit', async (e) => {
    const form = e.target;
    if (!(form instanceof HTMLFormElement)) return;
    const action = form.getAttribute('action') || '';
    const isAddToCart = action.includes('/cart/add') || form.matches('[action*="/cart/add"]');
    if (!isAddToCart) return;

    e.preventDefault();
    const btn = form.querySelector('[data-paws-add-to-cart], button[type="submit"]');
    const originalBtnText = btn ? btn.textContent : '';
    if (btn) { btn.disabled = true; }

    try {
      const formData = new FormData(form);
      const res = await fetch('/cart/add.js', { method: 'POST', body: formData });
      if (!res.ok) throw new Error('add failed');
      await refreshCart();
      openCart();
    } catch (_) {
      form.submit();
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = originalBtnText; }
    }
  });
}

// ─── 7. QUICK-ADD FEEDBACK ───────────────────────────────────────────────────
function initQuickAdd() {
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.paws-quick-add');
    if (!btn) return;

    const originalHTML = btn.innerHTML;
    btn.innerHTML = '✓';
    btn.style.background = '#7FE6C4';
    btn.disabled = true;

    // Pulse cart count badge
    const badge = document.querySelector('.paws-cart-count');
    if (badge) {
      const current = parseInt(badge.textContent, 10) || 0;
      badge.textContent = current + 1;
      badge.classList.add('pulse');
      setTimeout(() => badge.classList.remove('pulse'), 400);
    }

    setTimeout(() => {
      btn.innerHTML = originalHTML;
      btn.style.background = '';
      btn.disabled = false;
    }, 1200);
  });
}

// ─── 8. PDP GALLERY ──────────────────────────────────────────────────────────
function initPdpGallery() {
  const galleries = document.querySelectorAll('.paws-pdp-gallery');
  if (!galleries.length) return;

  galleries.forEach((gallery) => {
    const mainImg = gallery.querySelector('.paws-gallery-main img');
    const thumbs = gallery.querySelectorAll('.paws-thumb');
    if (!mainImg || !thumbs.length) return;

    thumbs.forEach((thumb) => {
      thumb.addEventListener('click', () => {
        const src = thumb.dataset.src || thumb.querySelector('img')?.src;
        if (!src) return;

        thumbs.forEach((t) => t.classList.remove('active'));
        thumb.classList.add('active');

        mainImg.style.opacity = '0';
        mainImg.style.transform = 'scale(0.97)';
        setTimeout(() => {
          mainImg.src = src;
          mainImg.style.opacity = '1';
          mainImg.style.transform = 'scale(1)';
        }, 180);
      });
    });
  });
}

// ─── 9. PDP OPTION BUTTONS ───────────────────────────────────────────────────
function initPdpOptions() {
  document.querySelectorAll('.paws-pdp-form-wrap').forEach((wrap) => {
    const variantDataEl = wrap.querySelector('[data-paws-variants]');
    let variants = [];
    try {
      variants = JSON.parse(variantDataEl?.textContent || '[]');
    } catch (_) {
      variants = [];
    }
    const optGroups = wrap.querySelectorAll('.paws-opt-group');
    const variantIdInput = wrap.querySelector('[data-paws-variant-id]');
    const atcButton = wrap.querySelector('[data-paws-add-to-cart]');
    const atcLabel = wrap.querySelector('[data-paws-atc-label]');

    function getSelectedOptions() {
      const values = [];
      optGroups.forEach((group) => {
        const active = group.querySelector('.paws-opt.active');
        values.push(active?.dataset.optionValue || null);
      });
      return values;
    }

    function findVariant(selectedOptions) {
      return variants.find((v) =>
        selectedOptions.every((val, i) => v.options[i] === val)
      );
    }

    function updateVariantState() {
      const selected = getSelectedOptions();
      const variant = findVariant(selected);
      if (!variant) return;

      if (variantIdInput) variantIdInput.value = variant.id;
      if (atcButton) atcButton.disabled = !variant.available;
      if (atcLabel) {
        const formatPrice = (cents) => {
          if (window.Shopify?.formatMoney) {
            return window.Shopify.formatMoney(cents);
          }
          return '$' + (cents / 100).toFixed(2);
        };
        atcLabel.textContent = variant.available
          ? `Add to cart · ${formatPrice(variant.price)}`
          : 'Sold out';
      }

      // Update main gallery image if variant has featured_image
      if (variant.featured_image?.src) {
        const mainImg = wrap.closest('.paws-pdp-section')?.querySelector('.paws-gallery-main img');
        if (mainImg) {
          mainImg.style.opacity = '0';
          setTimeout(() => {
            mainImg.src = variant.featured_image.src;
            mainImg.style.opacity = '1';
          }, 150);
        }
      }
    }

    optGroups.forEach((group) => {
      const btns = group.querySelectorAll('.paws-opt');
      const selectedLabel = group.querySelector('[data-paws-selected-value]');
      btns.forEach((btn) => {
        btn.addEventListener('click', () => {
          btns.forEach((b) => b.classList.remove('active'));
          btn.classList.add('active');
          if (selectedLabel) selectedLabel.textContent = btn.dataset.optionValue || '';
          updateVariantState();
        });
      });
    });
  });
}

// ─── 10. PDP QTY CONTROL ─────────────────────────────────────────────────────
function initPdpQty() {
  document.querySelectorAll('.paws-qty-wrap').forEach((wrap) => {
    const minus = wrap.querySelector('[data-paws-qty-minus]');
    const plus = wrap.querySelector('[data-paws-qty-plus]');
    const display = wrap.querySelector('.paws-qty-display, [data-paws-qty-display]');
    if (!display) return;

    // Hidden input sits outside the wrap, at form level
    const form = wrap.closest('form') || wrap.closest('.paws-pdp-form-wrap');
    const hiddenInput = form?.querySelector('[data-paws-qty-input]');

    let qty = parseInt(display.textContent, 10) || 1;

    function update() {
      display.textContent = qty;
      if (hiddenInput) hiddenInput.value = qty;
      if (minus) minus.disabled = qty <= 1;
    }

    if (minus) minus.addEventListener('click', () => { if (qty > 1) { qty--; update(); } });
    if (plus) plus.addEventListener('click', () => { qty++; update(); });
    update();
  });
}

// ─── 11. PDP ADD TO CART ─────────────────────────────────────────────────────
function initPdpAddToCart() {
  document.querySelectorAll('[data-paws-add-to-cart]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const original = btn.textContent;
      btn.textContent = 'Adding...';
      btn.disabled = true;

      setTimeout(() => {
        btn.textContent = 'Added!';
        btn.style.background = '#7FE6C4';
        btn.style.borderColor = '#1A1A1A';
        btn.style.color = '#1A1A1A';

        // Update cart count
        const badge = document.querySelector('.paws-cart-count');
        if (badge) {
          badge.textContent = (parseInt(badge.textContent, 10) || 0) + 1;
          badge.classList.add('pulse');
          setTimeout(() => badge.classList.remove('pulse'), 400);
        }

        // Open cart drawer if available
        setTimeout(() => {
          if (typeof window.pawsOpenCart === 'function') window.pawsOpenCart();
        }, 300);

        setTimeout(() => {
          btn.textContent = original;
          btn.style.background = '';
          btn.style.borderColor = '';
          btn.style.color = '';
          btn.disabled = false;
        }, 2000);
      }, 500);
    });
  });
}

// ─── 12. ACCORDION ───────────────────────────────────────────────────────────
function initAccordion() {
  document.querySelectorAll('.paws-acc-item').forEach((item) => {
    const trigger = item.querySelector('.paws-acc-trigger');
    const body = item.querySelector('.paws-acc-body');
    if (!trigger || !body) return;

    trigger.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      // Close siblings
      item.closest('.paws-acc-list')
        ?.querySelectorAll('.paws-acc-item.open')
        .forEach((openItem) => {
          openItem.classList.remove('open');
          const b = openItem.querySelector('.paws-acc-body');
          if (b) { b.style.maxHeight = '0'; b.style.opacity = '0'; }
          const t = openItem.querySelector('.paws-acc-trigger');
          if (t) t.setAttribute('aria-expanded', 'false');
        });

      if (!isOpen) {
        item.classList.add('open');
        body.style.maxHeight = body.scrollHeight + 'px';
        body.style.opacity = '1';
        trigger.setAttribute('aria-expanded', 'true');
      }
    });

    // Init closed
    body.style.maxHeight = '0';
    body.style.opacity = '0';
    body.style.overflow = 'hidden';
    body.style.transition = 'max-height 0.35s ease, opacity 0.25s ease';
    trigger.setAttribute('aria-expanded', 'false');
  });
}

// ─── 13. WISHLIST TOGGLE ─────────────────────────────────────────────────────
function initWishlist() {
  // Load from localStorage
  const saved = JSON.parse(localStorage.getItem('paws-wishlist') || '[]');

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.paws-wishlist');
    if (!btn) return;
    e.preventDefault();

    const id = btn.dataset.productId || btn.closest('[data-product-id]')?.dataset.productId || '';
    const wishlist = JSON.parse(localStorage.getItem('paws-wishlist') || '[]');
    const idx = wishlist.indexOf(id);

    if (idx === -1) {
      wishlist.push(id);
      btn.classList.add('active');
      btn.setAttribute('aria-label', 'Remove from wishlist');
    } else {
      wishlist.splice(idx, 1);
      btn.classList.remove('active');
      btn.setAttribute('aria-label', 'Add to wishlist');
    }

    localStorage.setItem('paws-wishlist', JSON.stringify(wishlist));

    // Heart beat animation
    btn.style.transform = 'scale(1.3)';
    setTimeout(() => { btn.style.transform = ''; }, 200);
  });

  // Apply saved state on init
  if (saved.length) {
    document.querySelectorAll('.paws-wishlist[data-product-id]').forEach((btn) => {
      if (saved.includes(btn.dataset.productId)) {
        btn.classList.add('active');
        btn.setAttribute('aria-label', 'Remove from wishlist');
      }
    });
  }
}

// ─── 14. PRODUCT CARD 3D TILT ────────────────────────────────────────────────
function initCardTilt() {
  const isMobile = () => window.matchMedia('(max-width: 749px)').matches;

  document.querySelectorAll('.paws-product').forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      if (isMobile()) return;
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      card.style.transform = `perspective(600px) rotateY(${x * 5}deg) rotateX(${-y * 5}deg) scale(1.02)`;
      card.style.transition = 'transform 0.1s ease';
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = 'transform 0.4s ease, box-shadow 0.2s ease';
    });
  });
}

// ─── 15. NEWSLETTER FORM ─────────────────────────────────────────────────────
function initNewsletter() {
  document.querySelectorAll('.paws-newsletter-form').forEach((form) => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = form.querySelector('input[type="email"]');
      const btn = form.querySelector('button[type="submit"]');
      if (!input || !btn) return;

      const originalText = btn.textContent;
      btn.textContent = '✓ Subscribed!';
      btn.style.background = '#7FE6C4';
      btn.disabled = true;
      input.value = '';

      setTimeout(() => {
        btn.textContent = originalText;
        btn.style.background = '';
        btn.disabled = false;
      }, 3000);
    });
  });
}

// ─── MARQUEE DUPLICATION + SPEED ─────────────────────────────────────────────
function initMarqueeSpeed() {
  document.querySelectorAll('.paws-marquee-track').forEach((track) => {
    // Duplicate inner content for seamless infinite scroll
    if (!track.dataset.duplicated) {
      const clone = document.createElement('div');
      clone.setAttribute('aria-hidden', 'true');
      clone.style.display = 'contents';
      clone.innerHTML = track.innerHTML;
      track.appendChild(clone);
      track.dataset.duplicated = 'true';
    }

    // Apply speed from data attribute (2-10s → 8-40s animation duration)
    const speed = track.dataset.speed;
    if (speed) {
      const duration = Math.max(20, parseFloat(speed) * 4);
      track.style.animationDuration = duration + 's';
    }
  });
}

// ─── INIT ALL ─────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initScrollReveal();
  initHeroSlider();
  initFilterPills();
  initCounters();
  initTestimonialsCarousel();
  initCartDrawer();
  initQuickAdd();
  initPdpGallery();
  initPdpOptions();
  initPdpQty();
  initPdpAddToCart();
  initAccordion();
  initWishlist();
  initCardTilt();
  initNewsletter();
  initMarqueeSpeed();
});

// Also handle Shopify's dynamic section rendering (theme editor)
if (window.Shopify?.designMode) {
  document.addEventListener('shopify:section:load', () => {
    initScrollReveal();
    initHeroSlider();
    initFilterPills();
    initCounters();
    initTestimonialsCarousel();
    initCartDrawer();
    initMarqueeSpeed();
  });
}
