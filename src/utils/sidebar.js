import * as date from "../utils/date.js"

const overlay = document.querySelector(".overlay");

export function initSidebar() {
    const dateElm = document.querySelector(".date");
    const nav = document.getElementById("nav-items");
    const navItems = document.querySelectorAll(".nav-item");
    if (!nav) return;
    const newData = date.formatFullJalali(Date.now())
    dateElm.innerHTML = newData;

    nav.addEventListener("click", e => {
        const link = e.target.closest(".nav-item");
        if (link) {
            navItems.forEach(item => item.classList.remove("nav-item-active"));
            link.classList.add("nav-item-active");
            setTimeout(() => {
                sidebar.classList.add("translate-x-full");
                overlay.classList.remove("overlay--show");
                document.body.classList.remove("overflow-hidden");
            }, 300)
        }
    });
}

export const setActivePage = page => {
    const navItems = document.querySelectorAll(".nav-item");
    let selectedPage;
    navItems.forEach(item => item.classList.remove("nav-item-active"));
    selectedPage = [...navItems].find(p => p.dataset.link == page)
    selectedPage.classList.add("nav-item-active");
}