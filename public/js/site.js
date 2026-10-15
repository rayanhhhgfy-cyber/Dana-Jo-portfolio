/* Dana Jo — interactions: overlay menu, scroll header, reveals, marquee */
(function () {
  "use strict";

  /* arm the reveal system: content stays visible unless JS is running */
  document.documentElement.classList.add("js");

  /* full-screen mobile menu */
  var burger = document.getElementById("burger");
  var menu = document.getElementById("mobileMenu");
  if (burger && menu) {
    burger.addEventListener("click", function () {
      var open = menu.classList.toggle("open");
      burger.classList.toggle("open", open);
      burger.setAttribute("aria-expanded", open ? "true" : "false");
      burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      document.body.style.overflow = open ? "hidden" : "";
    });
    menu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        menu.classList.remove("open");
        burger.classList.remove("open");
        burger.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
      });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && menu.classList.contains("open")) burger.click();
    });
  }

  /* header shrink on scroll */
  var header = document.getElementById("siteHeader");
  if (header) {
    var onScroll = function () {
      header.classList.toggle("scrolled", window.scrollY > 24);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* seamless marquee: duplicate track content once */
  var track = document.getElementById("marqueeTrack");
  if (track && !track.dataset.dup) {
    track.dataset.dup = "1";
    track.innerHTML += track.innerHTML;
  }

  /* ---------- WOW: hero headline word-by-word ---------- */
  var heroTitle = document.querySelector(".hero-title .line:first-child > span");
  if (heroTitle && !heroTitle.dataset.split) {
    heroTitle.dataset.split = "1";
    var words = heroTitle.textContent.trim().split(/\s+/);
    heroTitle.innerHTML = words.map(function (w, i) {
      return '<span class="w" style="transition-delay:' + (i * 0.09) + 's">' + w + "</span>";
    }).join(" ");
    // trigger after fonts/layout settle
    requestAnimationFrame(function () {
      setTimeout(function () {
        heroTitle.closest(".hero-title").classList.add("words-in");
      }, 150);
    });
  }

  /* ---------- WOW: floating sparkles in hero ---------- */
  var hero = document.querySelector(".hero");
  if (hero && !hero.querySelector(".hero-spark")) {
    ["s1", "s2"].forEach(function (cls) {
      var s = document.createElement("span");
      s.className = "hero-spark " + cls;
      s.setAttribute("aria-hidden", "true");
      s.textContent = "✳";
      hero.appendChild(s);
    });
  }

  /* ---------- WOW: count-up stats ---------- */
  var counters = document.querySelectorAll(".hstat b");
  function countUp(el) {
    var raw = el.textContent.trim();
    var m = raw.match(/^(\d+)/);
    if (!m || el.dataset.counted) return;
    el.dataset.counted = "1";
    var target = parseInt(m[1], 10);
    var suffix = raw.slice(m[1].length);
    var dur = 1100, t0 = null;
    function frame(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) {
        el.classList.add("tick");
        requestAnimationFrame(frame);
      } else {
        el.textContent = raw;
        el.classList.remove("tick");
      }
    }
    // start when visible
    if ("IntersectionObserver" in window) {
      var cio = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (e.isIntersecting) { cio.disconnect(); requestAnimationFrame(frame); }
        });
      }, { threshold: 0.4 });
      cio.observe(el);
    } else {
      requestAnimationFrame(frame);
    }
  }
  counters.forEach(countUp);

  /* scroll reveals (stagger via --d, direction via data-r) */
  var els = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && els.length) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -8% 0px" }
    );
    els.forEach(function (el) { io.observe(el); });
    /* safety net: never leave content invisible (slow observer, bg tab, odd browsers) */
    setTimeout(function () {
      document.querySelectorAll(".reveal:not(.in)").forEach(function (el) { el.classList.add("in"); });
      document.querySelectorAll(".hero-title:not(.words-in)").forEach(function (el) { el.classList.add("words-in"); });
    }, 2600);
  } else if (els.length) {
    els.forEach(function (el) { el.classList.add("in"); });
  }

  /* contact form — progressive enhancement, falls back to plain POST */
  var form = document.getElementById("contactForm");
  if (form) {
    form.addEventListener("submit", function (ev) {
      var name = form.querySelector('[name="name"]');
      var email = form.querySelector('[name="email"]');
      var msg = form.querySelector('[name="message"]');
      var ok = true;
      [name, email, msg].forEach(function (f) {
        var bad = !f.value.trim() || (f === email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value.trim()));
        f.style.borderColor = bad ? "#b0493d" : "";
        f.style.boxShadow = bad ? "0 0 0 4px rgba(176,73,61,0.14)" : "";
        if (bad) ok = false;
      });
      if (!ok) {
        ev.preventDefault();
        var first = form.querySelector('[style*="176,73,61"]');
        if (first) first.focus();
      }
    });
  }
})();
