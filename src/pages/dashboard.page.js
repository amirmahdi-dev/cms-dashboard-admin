import { getCoupons } from "../api/coupons.api.js";
import { getOrders } from "../api/orders.api.js"
import { getUsers } from "../api/users.api.js"
import { getProducts } from "../api/products.api.js"
import { navigate } from "../router.js";
import { setActivePage } from "../utils/sidebar.js"
import { setCurrentPage } from "../utils/state.js";
import * as date from "../utils/date.js";

let content;

export const init = () => {
    content = document.getElementById("content");

    content.addEventListener("click", handleContentClick);
    setInfo();
    setCurrentPage("dashboard")
}

export const destroy = () => {
    content.removeEventListener("click", handleContentClick);
};

// ================= HANDLERS ================

const handleContentClick = e => {
    const btn = e.target.closest("#show-all-users, #show-all-coupons, #show-all-orders, #show-all-products")
    if (!btn) return;
    const page = btn.dataset.link;
    setActivePage(page);
    navigate(page);
}

const getInfo = async () => {
    const coupons = await getCoupons();
    const orders = await getOrders();
    const products = await getProducts();
    const users = await getUsers();

    return { coupons, orders, products, users };
}

const setInfo = async () => {
    const totalUsersElm = document.getElementById("total-users");
    const totalProductsElm = document.getElementById("total-products");
    const totalOrdersElm = document.getElementById("total-orders");
    const totalCouponsElm = document.getElementById("total-coupons");

    const { coupons, orders, products, users } = await getInfo();

    totalCouponsElm.innerHTML = coupons.total;
    totalOrdersElm.innerHTML = orders.total;
    totalProductsElm.innerHTML = products.total;
    totalUsersElm.innerHTML = users.total;

    const userList = users.data.slice(-5);
    const productsList = products.data.slice(-5);
    const ordersList = orders.data.slice(-5);
    const couponsList = coupons.data.slice(-5);

    renderUsers(userList);
    renderProducts(productsList);
    renderOrders(ordersList);
    renderCoupons(couponsList);
}

// ================= RENDER =================

const renderUsers = users => {
    const wrapper = document.getElementById("user-recent");
    if (!wrapper) return;

    wrapper.innerHTML = "";
    if (users.length == 0) {
        wrapper.insertAdjacentHTML("beforeend", `<td class="text-center py-5" colspan="9">چیزی برای نمایش وجود ندارد.</td>`);
    } else {
        users.forEach(user => {
            wrapper.insertAdjacentHTML("beforeend",
                ` 
           <tr class="liquid-glass border-0 border-b border-gray-400 dark:border-gray-700 *:p-4 hover:bg-gray-600/50 dark:hover:text-white">
              <td>${user.userName}</td>
              <td>${user.email}</td>
              <td>${user.phone}</td>
              <td>${user.password}</td>
              <td>${date.formatJalaliDateTime(user.createAt)}</td>
              <td>${user.role}</td>
              <td class="text-center">
                <span class="${user.status ? "active" : "not-active"}">
                  ${user.status ? "فعال" : "غیرفعال"}
                </span>
              </td>
            </tr> 
          `
            );
        });
    }
}

const renderProducts = products => {
    const wrapper = document.getElementById("products-recent");
    if (!wrapper) return;

    wrapper.innerHTML = "";
    if (!products.length) {
        wrapper.insertAdjacentHTML(
            "beforeend",
            `<td class="text-center py-5" colspan="9">چیزی برای نمایش وجود ندارد.</td>`
        );
        return;
    }

    products.forEach(product => {
        wrapper.insertAdjacentHTML("beforeend", `
          <tr class="liquid-glass border-0 border-b border-gray-400 dark:border-gray-700 *:p-4">
            <td>
              <div class="size-22">
                <img src="${product.img || "/img/images.png"}"
                class="w-full h-full object-cover"/>
              </div>
            </td>
            <td>${product.name}</td>
            <td>${product.price !== 0 ? product.price.toLocaleString() + " تومان" : "رایگان"}</td>
            <td>${product.category || "فاقد دسته بندی"}</td>
            <td>${product.qty} عدد</td>
            <td>${date.formatJalaliDateTime(product.createdAt)}</td>
            <td>${product.offer}%</td>
            <td>
              <span class="${product.status ? "active" : "not-active"}">
                ${product.status ? "فعال" : "غیرفعال"}
              </span>
            </td>
          </tr>
        `);
    });
}

const renderOrders = orders => {
    const wrapper = document.getElementById("orders-recent");
    if (!wrapper) return;

    wrapper.innerHTML = "";
    if (orders.length == 0) {
        wrapper.insertAdjacentHTML("beforeend", `<td class="text-center py-5" colspan="9">چیزی برای نمایش وجود ندارد.</td>`)
    } else {
        orders.forEach(order => {
            wrapper.insertAdjacentHTML("beforeend",
                ` 
           <tr class="liquid-glass border-0 border-b border-gray-400 dark:border-gray-700 *:p-4 hover:bg-gray-600/50 dark:hover:text-white">
              <td>${order.user}</td>
              <td>${order.userPhone}</td>
              <td>${order.description || "توضیحی وجود ندارد."}</td>
              <td>${order.paymentMethod || "نامشخص"}</td>
              <td>${order.totalPrice.toLocaleString()} تومان</td>
              <td>${date.formatJalaliDateTime(order.createAt) || "پرداخت نشده"}</td>
              <td>${order.status == null ? date.formatJalaliDateTime(order.purchaseAt) : "پرداخت نشده"}</td>
              <td class="text-center">
                <div class="${order.status === "در انتظار پرداخت" ? "pending" : order.status === "لغو شده" ? "not-active" : "active"} w-max">
                  ${order.status}
                </div>
              </td>
            </tr> 
          `
            );
        });
    }
}

const renderCoupons = coupons => {
    const wrapper = document.getElementById("coupons-recent");
    if (!wrapper) return;

    wrapper.innerHTML = "";
    if (coupons.length == 0) {
        wrapper.insertAdjacentHTML("beforeend", `<td class="text-center py-5" colspan="9">چیزی برای نمایش وجود ندارد.</td>`)
    } else {
        coupons.forEach(coupon => {
            wrapper.insertAdjacentHTML("beforeend",
                `
            <tr class="liquid-glass border-0 border-b border-gray-400 dark:border-gray-700 *:p-4 hover:bg-gray-600/50 dark:hover:text-white">
              <td class="">${coupon.coupon}</td>
              <td class="">
                <div class="line-clamp-3">${coupon.description || "توضیحی ندارد."}</div>
              </td>
              <td class="">${coupon.qty}</td>
              <td class="">${coupon.used}</td>
              <td class="">${date.formatJalaliDateTime(coupon.createAt)}</td>
              <td class="">${date.formatJalaliDateTime(coupon.expireAt)}</td>
              <td class="">${coupon.category || "همه دسته بندی ها"}</td>
              <td class="text-center">
                <span class="${coupon.status ? "active" : "not-active"}">
                  ${coupon.status ? "فعال" : "غیرفعال"}
                </span>
              </td>
            </tr>
          `
            );
        });
    }
}