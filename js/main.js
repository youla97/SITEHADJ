/* =========================================================
   HADJ GUINÉE — Script principal
   ========================================================= */
document.addEventListener('DOMContentLoaded', () => {

  /* ---------- PRELOADER ---------- */
  const preloader = document.getElementById('preloader');
  window.addEventListener('load', () => {
    setTimeout(() => preloader.classList.add('hidden'), 400);
  });
  // Filet de sécurité si l'évènement "load" tarde (images externes)
  setTimeout(() => preloader && preloader.classList.add('hidden'), 2500);

  /* ---------- ANNÉE FOOTER ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- HEADER STICKY ---------- */
  const header = document.getElementById('header');
  const onScrollHeader = () => {
    if (window.scrollY > 60) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  };
  window.addEventListener('scroll', onScrollHeader);
  onScrollHeader();

  /* ---------- MENU MOBILE ---------- */
  const burger = document.getElementById('burger');
  const nav = document.getElementById('nav');
  const overlay = document.createElement('div');
  overlay.className = 'nav-overlay';
  document.body.appendChild(overlay);

  function toggleMenu(open) {
    const isOpen = open !== undefined ? open : !nav.classList.contains('open');
    nav.classList.toggle('open', isOpen);
    burger.classList.toggle('active', isOpen);
    overlay.classList.toggle('show', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }
  burger.addEventListener('click', () => toggleMenu());
  overlay.addEventListener('click', () => toggleMenu(false));
  nav.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => toggleMenu(false));
  });

  /* ---------- SCROLLSPY (lien actif) ---------- */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  const spyObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach(sec => spyObserver.observe(sec));

  /* ---------- SCROLL REVEAL (data-aos léger) ---------- */
  // Note : on vérifie les positions via getBoundingClientRect sur l'évènement
  // "scroll" plutôt que de dépendre uniquement d'IntersectionObserver, car un
  // défilement très rapide (molette, touche Fin, geste sur mobile) peut sauter
  // par-dessus un élément entre deux frames et le laisser bloqué à opacity:0.
  const revealEls = Array.from(document.querySelectorAll('[data-aos]'));
  function checkReveal() {
    const vh = window.innerHeight;
    revealEls.forEach(el => {
      if (el.classList.contains('aos-show')) return;
      const rect = el.getBoundingClientRect();
      // Pas de condition sur rect.bottom : un élément déjà dépassé (au-dessus de
      // l'écran) doit rester révélé, sinon un saut de défilement instantané qui
      // l'enjambe complètement le laisserait invisible pour toujours.
      if (rect.top < vh * 0.92) el.classList.add('aos-show');
    });
  }

  /* ---------- COMPTEUR ANIMÉ (stats) ---------- */
  const counters = Array.from(document.querySelectorAll('.stat-number'));
  function animateCounter(el) {
    const target = parseInt(el.dataset.count, 10);
    const suffix = el.dataset.suffix || '';
    const duration = 1600;
    const start = performance.now();
    function step(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target) + suffix;
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target + suffix;
    }
    requestAnimationFrame(step);
  }
  function checkCounters() {
    const vh = window.innerHeight;
    counters.forEach(el => {
      if (el.dataset.done) return;
      const rect = el.getBoundingClientRect();
      if (rect.top < vh * 0.9) {
        el.dataset.done = '1';
        animateCounter(el);
      }
    });
  }

  let scrollTicking = false;
  function onScrollChecks() {
    if (scrollTicking) return;
    scrollTicking = true;
    requestAnimationFrame(() => {
      checkReveal();
      checkCounters();
      scrollTicking = false;
    });
  }
  window.addEventListener('scroll', onScrollChecks, { passive: true });
  window.addEventListener('resize', onScrollChecks);
  window.addEventListener('load', onScrollChecks);
  checkReveal();
  checkCounters();

  // Filet de sécurité : un saut de défilement instantané (touche "Fin", barre de
  // défilement glissée d'un coup) peut ne déclencher qu'un seul évènement "scroll"
  // et sauter entièrement la fenêtre de visibilité d'un élément. Ce filet garantit
  // que tout reste révélé même dans ce cas, sans dépendre du motif de défilement.
  const safetyNet = setInterval(() => {
    checkReveal();
    checkCounters();
    if (document.querySelectorAll('[data-aos]:not(.aos-show)').length === 0) clearInterval(safetyNet);
  }, 700);

  /* ---------- COMPTE À REBOURS ---------- */
  const countdownEl = document.getElementById('countdown');
  if (countdownEl) {
    const target = new Date(countdownEl.dataset.target).getTime();
    const dEl = document.getElementById('cd-days');
    const hEl = document.getElementById('cd-hours');
    const mEl = document.getElementById('cd-minutes');
    const sEl = document.getElementById('cd-seconds');

    function pad(n) { return String(n).padStart(2, '0'); }

    function updateCountdown() {
      const now = Date.now();
      let diff = target - now;
      if (diff < 0) diff = 0;
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      dEl.textContent = pad(days);
      hEl.textContent = pad(hours);
      mEl.textContent = pad(minutes);
      sEl.textContent = pad(seconds);
    }
    updateCountdown();
    setInterval(updateCountdown, 1000);
  }

  /* ---------- TÉMOIGNAGES (carousel) ---------- */
  const testiTrack = document.getElementById('testiTrack');
  const testiCards = testiTrack ? testiTrack.querySelectorAll('.testi-card') : [];
  const testiDotsWrap = document.getElementById('testiDots');
  let testiIndex = 0;
  let testiTimer;

  if (testiTrack && testiCards.length) {
    testiCards.forEach((_, i) => {
      const dot = document.createElement('span');
      if (i === 0) dot.classList.add('active');
      dot.addEventListener('click', () => goToTesti(i));
      testiDotsWrap.appendChild(dot);
    });

    function goToTesti(i) {
      testiIndex = (i + testiCards.length) % testiCards.length;
      testiTrack.style.transform = `translateX(-${testiIndex * 100}%)`;
      testiDotsWrap.querySelectorAll('span').forEach((d, idx) => d.classList.toggle('active', idx === testiIndex));
    }

    function startAuto() {
      clearInterval(testiTimer);
      testiTimer = setInterval(() => goToTesti(testiIndex + 1), 5500);
    }

    document.getElementById('testiPrev').addEventListener('click', () => { goToTesti(testiIndex - 1); startAuto(); });
    document.getElementById('testiNext').addEventListener('click', () => { goToTesti(testiIndex + 1); startAuto(); });

    startAuto();
  }

  /* ---------- FAQ ACCORDION ---------- */
  document.querySelectorAll('.faq-item').forEach(item => {
    const question = item.querySelector('.faq-question');
    question.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
      if (!isActive) item.classList.add('active');
    });
  });

  /* ---------- GALERIE + LIGHTBOX ---------- */
  const galleryImgs = Array.from(document.querySelectorAll('.gallery-item img'));
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  let lbIndex = 0;

  function openLightbox(i) {
    lbIndex = i;
    lightboxImg.src = galleryImgs[i].src;
    lightboxImg.alt = galleryImgs[i].alt;
    lightbox.classList.add('show');
    document.body.style.overflow = 'hidden';
  }
  function closeLightbox() {
    lightbox.classList.remove('show');
    document.body.style.overflow = '';
  }
  function showLightbox(step) {
    lbIndex = (lbIndex + step + galleryImgs.length) % galleryImgs.length;
    lightboxImg.src = galleryImgs[lbIndex].src;
    lightboxImg.alt = galleryImgs[lbIndex].alt;
  }

  galleryImgs.forEach((img, i) => {
    img.parentElement.addEventListener('click', () => openLightbox(i));
  });
  document.getElementById('lightboxClose').addEventListener('click', closeLightbox);
  document.getElementById('lightboxPrev').addEventListener('click', () => showLightbox(-1));
  document.getElementById('lightboxNext').addEventListener('click', () => showLightbox(1));
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('show')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') showLightbox(-1);
    if (e.key === 'ArrowRight') showLightbox(1);
  });

  /* ---------- BACK TO TOP ---------- */
  const backToTop = document.getElementById('backToTop');
  window.addEventListener('scroll', () => {
    backToTop.classList.toggle('show', window.scrollY > 500);
  });
  backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  /* ---------- FORMULAIRE DE CONTACT -> WHATSAPP ---------- */
  // Remplacez ce numéro par le numéro WhatsApp professionnel réel de l'agence (format international, sans "+").
  const WHATSAPP_NUMBER = '224600000000';

  const contactForm = document.getElementById('contactForm');
  const formNote = document.getElementById('formNote');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('fname').value.trim();
      const phone = document.getElementById('fphone').value.trim();
      const email = document.getElementById('femail').value.trim();
      const forfait = document.getElementById('fforfait').value;
      const message = document.getElementById('fmessage').value.trim();

      if (!name || !phone || !message) {
        formNote.textContent = 'Merci de remplir les champs obligatoires (nom, téléphone, message).';
        formNote.style.color = '#c0392b';
        return;
      }

      const text = [
        `Nouvelle demande - Hadj Guinée`,
        `Nom: ${name}`,
        `Téléphone: ${phone}`,
        email ? `Email: ${email}` : null,
        `Forfait souhaité: ${forfait}`,
        `Message: ${message}`
      ].filter(Boolean).join('\n');

      const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
      formNote.textContent = 'Merci ! Ouverture de WhatsApp pour finaliser votre demande...';
      formNote.style.color = 'var(--primary)';
      window.open(url, '_blank', 'noopener');
      contactForm.reset();
    });
  }

  /* ---------- NEWSLETTER (démo statique) ---------- */
  const newsletterForm = document.getElementById('newsletterForm');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = newsletterForm.querySelector('input');
      input.value = '';
      input.placeholder = 'Merci pour votre inscription !';
    });
  }

});
