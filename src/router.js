import * as dashboardPage from "./pages/dashboard.page.js";
import * as productsPage from "./pages/products.page.js";
import * as usersPage from "./pages/users.page.js";
import * as ordersPage from "./pages/orders.page.js";
import * as couponsPage from "./pages/coupons.page.js";

const routes = {
  dashboard: {
    page: dashboardPage,
    template: "/pages/dashboard.html"
  },
  products: {
    page: productsPage,
    template: "/pages/products.html"
  },
  users: {
    page: usersPage,
    template: "/pages/users.html"
  },
  coupons: {
    page: couponsPage,
    template: "/pages/coupons.html"
  },
  orders: {
    page: ordersPage,
    template: "/pages/orders.html"
  }
};

let currentPage = null;

// ---------- load html ----------
const loadTemplate = async path => {
  const res = await fetch(path);
  return await res.text();
};

// ---------- navigation ----------
export const navigate = async routeName => {

  const route = routes[routeName];
  if (!route) return;

  // destroy old page
  if (currentPage?.destroy) {
    currentPage.destroy();
  }

  // load template
  const html = await loadTemplate(route.template);
  document.getElementById("content").innerHTML = html;

  // init new page
  route.page.init();
  currentPage = route.page;

  // update url
  history.pushState({ route: routeName }, "", `#${routeName}`);
};

// ---------- back / forward ----------
window.addEventListener("popstate", e => {
  const route = e.state?.route || "dashboard";
  navigate(route);
});
