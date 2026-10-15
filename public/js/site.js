/* Dana Jo — interactions: overlay menu, scroll header, reveals, marquee */
(function () {
  "use strict";

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
  } else {
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
