import { navigate } from "./router.js";
import { loadCurrentPage } from "./utils/state.js";
import { initSidebar } from "./utils/sidebar.js";
import { setActivePage } from "./utils/sidebar.js";

window.addEventListener("DOMContentLoaded", async () => {
  const sidebar = document.querySelector("#sidebar");
  const menu = document.querySelector("#menu-toggle");
  const overlay = document.querySelector(".overlay");

  // ---------- load sidebar ----------
  const sidebarHTML = await fetch("/src/layouts/_sidebar.html")
    .then(r => r.text());

  sidebar.innerHTML = sidebarHTML;

  initSidebar();

  // ----------- theme btn -----------
  const themeBtn = document.getElementById("theme-btn");
  const themeIcon = document.getElementById("theme-icon");
  const themeTitle = document.getElementById("theme-title");
  const html = document.querySelector("html");

  const setTheme = () => {
    const isDark = html.classList.toggle("dark");

    themeIcon.innerHTML = `<use href="#${isDark ? "sun" : "moon"}"></use>`;
    themeTitle.innerHTML = `${isDark ? "تم روشن" : "تم تیره"}`;
    localStorage.setItem("theme", isDark ? "dark" : "light");
  };

  const initTheme = () => {
    const savedTheme = localStorage.getItem("theme");

    if (savedTheme === "dark") {
      html.classList.add("dark");
      themeIcon.innerHTML = `<use href="#sun"></use>`;
      themeTitle.innerHTML = `تم روشن`;
    } else {
      html.classList.remove("dark");
      themeIcon.innerHTML = `<use href="#moon"></use>`;
      themeTitle.innerHTML = `تم تیره`;
    }
  };

  initTheme();
  themeBtn.addEventListener("click", setTheme);

  // ---------- navigation ----------
  sidebar.addEventListener("click", e => {
    const page = e.target.closest("[data-link]")?.dataset.link;
    if (!page) return;

    e.preventDefault();
    navigate(page);
  });

  // ---------- mobile menu ----------
  const showMenu = e => {
    e.stopPropagation();
    sidebar.classList.remove("translate-x-full");
    overlay.classList.add("overlay--show");
    document.body.classList.add("overflow-hidden");
  };

  const closeMenu = () => {
    sidebar.classList.add("translate-x-full");
    overlay.classList.remove("overlay--show");
    document.body.classList.remove("overflow-hidden");
  };

  overlay.addEventListener("click", closeMenu);
  menu.addEventListener("click", showMenu);

  // ---------- default page ----------
  navigate(loadCurrentPage());
  setActivePage(localStorage.getItem("page"));
});
