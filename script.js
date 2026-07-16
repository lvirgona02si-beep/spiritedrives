// Nav scroll state
const nav = document.getElementById('nav');
const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 40);
document.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// Mobile nav toggle
const navToggle = document.getElementById('navToggle');
const navMobile = document.getElementById('navMobile');
navToggle.addEventListener('click', () => navMobile.classList.toggle('is-open'));
navMobile.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navMobile.classList.remove('is-open')));

// Scroll reveal
const revealEls = document.querySelectorAll('.reveal');
const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
revealEls.forEach(el => io.observe(el));

// Garage carousel (fleet select)
const garageTrack = document.getElementById('garageTrack');
if (garageTrack) {
  const slides = Array.from(garageTrack.querySelectorAll('.garage-slide'));
  const thumbs = Array.from(document.querySelectorAll('.garage__thumb'));
  const prevBtns = Array.from(document.querySelectorAll('.garage__arrow--prev'));
  const nextBtns = Array.from(document.querySelectorAll('.garage__arrow--next'));
  let current = 0;

  const setActive = (index) => {
    current = index;
    thumbs.forEach((t, i) => t.classList.toggle('is-active', i === index));
  };

  const goTo = (index) => {
    const clamped = Math.max(0, Math.min(slides.length - 1, index));
    slides[clamped].scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
  };

  prevBtns.forEach(btn => btn.addEventListener('click', () => goTo(current - 1)));
  nextBtns.forEach(btn => btn.addEventListener('click', () => goTo(current + 1)));
  thumbs.forEach((thumb, i) => thumb.addEventListener('click', () => goTo(i)));

  const slideObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && entry.intersectionRatio > 0.6) {
        setActive(Number(entry.target.dataset.index));
      }
    });
  }, { root: garageTrack, threshold: 0.6 });
  slides.forEach(s => slideObserver.observe(s));
}

// Gallery carousel (guest experience — video + photos)
const galleryTrack = document.getElementById('galleryTrack');
if (galleryTrack) {
  const slides = Array.from(galleryTrack.querySelectorAll('.gallery__slide'));
  const thumbs = Array.from(document.querySelectorAll('.gallery__thumb'));
  const prevBtns = Array.from(document.querySelectorAll('.gallery__arrow--prev'));
  const nextBtns = Array.from(document.querySelectorAll('.gallery__arrow--next'));
  let current = 0;

  const setActive = (index) => {
    current = index;
    thumbs.forEach((t, i) => t.classList.toggle('is-active', i === index));
  };

  const goTo = (index) => {
    const clamped = Math.max(0, Math.min(slides.length - 1, index));
    slides[clamped].scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
  };

  prevBtns.forEach(btn => btn.addEventListener('click', () => goTo(current - 1)));
  nextBtns.forEach(btn => btn.addEventListener('click', () => goTo(current + 1)));
  thumbs.forEach((thumb, i) => thumb.addEventListener('click', () => goTo(i)));

  const slideObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && entry.intersectionRatio > 0.6) {
        setActive(Number(entry.target.dataset.index));
      }
    });
  }, { root: galleryTrack, threshold: 0.6 });
  slides.forEach(s => slideObserver.observe(s));
}

// Route rail (vertical pin-to-pin route graphic beside the day list)
const routeRail = document.getElementById('routeRail');
const routeList = document.getElementById('routeList');
if (routeRail && routeList) {
  const PIN_PATH = 'M12 2a7 7 0 00-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 00-7-7z';

  const pinMarkup = (cx, tipY, scale) => `
    <path d="${PIN_PATH}" fill="var(--green)" transform="translate(${cx} ${tipY}) scale(${scale}) translate(-12 -22)"></path>
    <circle cx="12" cy="9" r="3.1" fill="var(--white)" transform="translate(${cx} ${tipY}) scale(${scale}) translate(-12 -22)"></circle>`;

  const dotMarkup = (cx, cy) => `
    <circle cx="${cx}" cy="${cy}" r="5" fill="var(--white)"></circle>
    <circle cx="${cx}" cy="${cy}" r="4" fill="var(--gold)"></circle>`;

  const draw = () => {
    const days = Array.from(routeList.querySelectorAll('.route__day'));
    if (!days.length) return;

    const railRect = routeRail.getBoundingClientRect();
    const w = routeRail.clientWidth;
    const h = routeRail.clientHeight;
    if (w === 0 || h === 0) return;

    const leftX = w * 0.26;
    const rightX = w * 0.58;

    const points = days.map((day, i) => {
      const r = day.getBoundingClientRect();
      return {
        x: i % 2 === 0 ? leftX : rightX,
        y: (r.top - railRect.top) + r.height / 2
      };
    });

    let pathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const p0 = points[i - 1], p1 = points[i];
      const midY = (p0.y + p1.y) / 2;
      pathD += ` C ${p0.x} ${midY}, ${p1.x} ${midY}, ${p1.x} ${p1.y}`;
    }

    let markers = '';
    points.forEach((p, i) => {
      if (i === 0 || i === points.length - 1) {
        markers += pinMarkup(p.x, p.y, w < 40 ? 0.72 : 0.85);
      } else {
        markers += dotMarkup(p.x, p.y);
      }
    });

    routeRail.innerHTML = `
      <svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
        <path d="${pathD}" fill="none" stroke="var(--gold)" stroke-width="2" stroke-linecap="round" stroke-dasharray="1 9"></path>
        ${markers}
      </svg>`;
  };

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(draw, 150);
  });
  window.addEventListener('load', () => setTimeout(draw, 60));
  document.fonts?.ready.then(() => setTimeout(draw, 30));
  setTimeout(draw, 0);
}

// Book form (front-end only placeholder — wire to real backend/CRM later)
const bookForm = document.getElementById('bookForm');
const bookSuccess = document.getElementById('bookSuccess');
if (bookForm) {
  bookForm.addEventListener('submit', (e) => {
    e.preventDefault();
    bookForm.style.display = 'none';
    bookSuccess.classList.add('is-visible');
  });
}
