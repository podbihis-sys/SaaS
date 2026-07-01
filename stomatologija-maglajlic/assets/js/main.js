/* ===== Header scroll state + progress bar ===== */
const header = document.getElementById('header');
const progress = document.getElementById('scrollProgress');

function onScroll(){
  const y = window.scrollY;
  header.classList.toggle('scrolled', y > 40);
  const h = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* ===== Mobile nav ===== */
const toggle = document.getElementById('navToggle');
const nav = document.getElementById('nav');
toggle.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  toggle.classList.toggle('open', open);
  toggle.setAttribute('aria-expanded', open);
});
nav.querySelectorAll('a').forEach(a =>
  a.addEventListener('click', () => {
    nav.classList.remove('open');
    toggle.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  })
);

/* ===== Reveal on scroll ===== */
const io = new IntersectionObserver((entries) => {
  entries.forEach((e, i) => {
    if (e.isIntersecting){
      e.target.style.transitionDelay = Math.min(i * 60, 240) + 'ms';
      e.target.classList.add('in');
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
document.querySelectorAll('[data-animate]').forEach(el => io.observe(el));

/* ===== Animated counters ===== */
function animateCount(el){
  const target = +el.dataset.count;
  const dur = 1600;
  const start = performance.now();
  function tick(now){
    const p = Math.min((now - start) / dur, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    const val = Math.floor(eased * target);
    el.textContent = val >= 1000 ? val.toLocaleString('bs-BA') : val;
    if (p < 1) requestAnimationFrame(tick);
    else el.textContent = target >= 1000 ? target.toLocaleString('bs-BA') : target;
  }
  requestAnimationFrame(tick);
}
const counterIO = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting){ animateCount(e.target); counterIO.unobserve(e.target); }
  });
}, { threshold: 0.6 });
document.querySelectorAll('[data-count]').forEach(el => counterIO.observe(el));

/* ===== Contact form (demo, no backend) ===== */
function handleSubmit(e){
  e.preventDefault();
  const form = e.target;
  const note = document.getElementById('formNote');
  const name = form.name.value.trim();
  note.textContent = `Hvala${name ? ', ' + name : ''}! Vaš upit je zabilježen — kontaktiraćemo vas uskoro.`;
  form.reset();
  return false;
}

/* ===== Current year ===== */
document.getElementById('year').textContent = new Date().getFullYear();
