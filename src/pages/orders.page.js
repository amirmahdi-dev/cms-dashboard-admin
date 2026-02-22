import * as api from "../api/orders.api.js";
import * as userApi from "../api/users.api.js";
import * as productApi from "../api/products.api.js";
import * as ui from "../ui/modal.js";
import * as utils from "../utils/toast.js";
import * as date from "../utils/date.js";
import * as state from "../utils/state.js";
import { Pagination } from "../utils/pagination.js";
import { debounce } from "../utils/debounce.js";
import { downloadInvoice } from "../utils/downloadInvoice.js";
import { setCurrentPage } from "../utils/state.js";

const userPhoneInput = document.querySelector("#user-phone");
const productSearchInput = document.querySelector("#product-search");
const productSearchResult = document.querySelector("#product-result");
const userSearchInput = document.querySelector("#user-search");
const userSearchResult = document.querySelector("#user-result");
const modalProductWrapper = document.querySelector("#modal-product-wrapper");
const paymentMethodInput = document.querySelector("#Payment-method");
const orderStatusInput = document.querySelector("#order-status");
const descriptionInput = document.querySelector("#description");
const totalPriceElm = document.querySelector("#total-price");

const submitBtn = document.querySelector(".submit-btn");
const closeBtn = document.querySelector(".danger-btn");

const confirmOk = document.getElementById("confirm-ok");
const confirmCancel = document.getElementById("confirm-cancel");

let orderID;
let content;
let items = [];

export const init = () => {
  content = document.getElementById("content");

  content.addEventListener("input", handleSearchInput);
  content.addEventListener("change", handleFilterChange);
  content.addEventListener("click", handleContentClick);

  submitBtn.addEventListener("click", handleSubmit);
  closeBtn.addEventListener("click", handleCloseModal);

  confirmOk.addEventListener("click", handleConfirmDelete);
  confirmCancel.addEventListener("click", ui.hideConfirmModal);

  productSearchInput.addEventListener("input", handelSearchProductInput);
  productSearchResult.addEventListener("click", handleSelectedProduct);
  modalProductWrapper.addEventListener("click", handelRemoveProduct);

  userSearchInput.addEventListener("input", handelSearchUserInput);
  userSearchResult.addEventListener("click", handleSelectedUser);

  ui.bindModalEvents();
  loadOrdersByState();
  renderModalOrders(items);

  setCurrentPage("orders")
};

export const destroy = () => {
  content.removeEventListener("input", handleSearchInput);
  content.removeEventListener("change", handleFilterChange);
  content.removeEventListener("click", handleContentClick);

  submitBtn.removeEventListener("click", handleSubmit);
  closeBtn.removeEventListener("click", handleCloseModal);

  confirmOk.removeEventListener("click", handleConfirmDelete);
  confirmCancel.removeEventListener("click", ui.hideConfirmModal);

  userSearchInput.addEventListener("input", handelSearchUserInput);
  userSearchResult.addEventListener("click", handleSelectedUser);

  state.restState()
};

// ================= Handlers =================

const handleSearchInput = e => {
  if (e.target.id !== "search-box") return;

  state.queryState.search = e.target.value.trim();
  state.queryState.page = 1;
  debouncedLoadOrders();
};

const handleFilterChange = e => {
  if (e.target.id !== "products-filter") return;

  const val = e.target.value;

  state.queryState.page = 1;
  state.queryState.status = null;
  state.queryState.sort = null;

  if (val === "در انتظار پرداخت") state.queryState.status = "در انتظار پرداخت";
  else if (val === "پرداخت شده") state.queryState.status = "پرداخت شده";
  else if (val === "لغو شده") state.queryState.status = "لغو شده";
  else if (val === "pur") state.queryState.sort = "&_sort=purchaseAt&_order=desc";
  else if (val === "cre") state.queryState.sort = "&_sort=createAt&_order=desc";

  loadOrdersByState();
};

const handleContentClick = async e => {
  const btn = e.target.closest(".btn-download-order, .btn-delete-order, .create-order");
  if (!btn) return;

  if (btn.classList.contains("btn-download-order")) {
    orderID = btn.dataset.id;
    const order = await api.getOrderById(+orderID);
    downloadInvoice(order.data);
  }

  else if (btn.classList.contains("btn-delete-order")) {
    orderID = btn.dataset.id;
    ui.showConfirmModal();
  }

  else if (btn.classList.contains("create-order")) {
    ui.showModal("ثبت سفارش جدید", "order");
  }
};

const handleSubmit = async () => {
  submitBtn.disabled = true;
  if (userSearchInput.value && userPhoneInput.value) {
    await api.createOrder(getInputValue());
    utils.notify.success("سفارش با موفقیت ثبت شد.", "موفق");

    loadOrdersByState();
    ui.hideModal("order");
    clearInputValue();
  } else {
    utils.notify.error("فیلد های نام کاربری و شماره موبایل نمیتواند خالی باشد.", "")
  }
  submitBtn.disabled = false;
};

const handleCloseModal = () => {
  ui.hideModal("order");
  clearInputValue();
};

const handleConfirmDelete = async () => {
  confirmOk.disabled = true;
  confirmOk.classList.add("disable-btn");
  await api.deleteOrder(+orderID);
  const query = `?_page=${state.queryState.page}&_limit=10`;
  const { data } = await api.getOrdersByQuery(query);

  if (data.length == 0) {
    if (queryState.page == 0) return;
    queryState.page--;
  }
  loadOrdersByState();
  ui.hideConfirmModal();
  confirmOk.disabled = false;
  confirmOk.classList.remove("disable-btn");
};

const handelSearchProductInput = async () => {
  productSearchResult.innerHTML = "";
  const value = productSearchInput.value.trim();
  if (!value) {
    productSearchResult.classList.add("hidden")
    return
  };

  const products = await productApi.getProductsByQuery(`?name_like=${value}`);
  productSearchResult.classList.remove("hidden");
  console.log(products);
  if (products.data.length == 0) {
    productSearchResult.insertAdjacentHTML("beforeend",
      `
      <div class="product text-black text-center p-2 hover:bg-gray-100 cursor-pointer">
        محصولی یافت نشد
      </div>
  `)
  } else {
    products.data.forEach(p => {
      productSearchResult.insertAdjacentHTML("beforeend",
        `
      <div data-id=${p.id} class="product flex justify-between p-2 hover:bg-gray-100 cursor-pointer">
        <span class="text-black">${p.name}</span>
        <span class="text-sm text-gray-400">${p.price.toLocaleString()}</span>
      </div>`)
    })
  }
};

const handleSelectedProduct = async e => {
  const productElm = e.target.closest(".product");
  const productID = productElm.dataset.id;

  const product = await productApi.getProductsById(+productID);

  items.push({
    productID: product.data.length + 1,
    productName: product.data.name,
    productPrice: product.data.price,
    qty: 1
  });

  renderModalOrders(items);
  productSearchResult.classList.add("hidden");
  productSearchInput.value = "";
  totalPriceElm.innerHTML = handelTotalPrice();
};

const handelRemoveProduct = e => {
  const btn = e.target.closest(".remove");
  if (!btn) return;
  const productID = btn.dataset.id;
  const index = items.findIndex(p => p.productID == productID);
  items.splice(index, 1);
  renderModalOrders(items);
  totalPriceElm.innerHTML = handelTotalPrice();
};

const handelSearchUserInput = async () => {
  userSearchResult.innerHTML = "";
  const value = userSearchInput.value.trim();
  if (!value) {
    userSearchResult.classList.add("hidden");
    return;
  };

  const users = await userApi.getUsersByQuery(`? userName_like = ${value} `);
  userSearchResult.classList.remove("hidden");
  if (users.data.length == 0) {
    userSearchResult.insertAdjacentHTML("beforeend",
      `
      <div class="p-2 hover:bg-gray-100 cursor-pointer" >
        کاربری یافت نشد
      </div>
  `)
  } else {
    users.data.forEach(u => {
      userSearchResult.insertAdjacentHTML("beforeend",
        `
        <div data-id=${u.id} class="user p-2 hover:bg-gray-100 cursor-pointer" >
          ${u.userName}
        </div>
  `)
    })
  }
};

const handleSelectedUser = async e => {
  const userElm = e.target.closest(".user");
  const userID = userElm.dataset.id;

  const user = await userApi.getUsersById(+userID);
  console.log(userID, user);

  userSearchInput.value = user.data.userName;
  userPhoneInput.value = user.data.phone;
  userSearchResult.classList.add("hidden");
};

const handelTotalPrice = () => {
  const totalPrice = items.reduce((sum, item) => {
    return sum + (item.productPrice * item.qty);
  }, 0);
  return totalPrice.toLocaleString();
};

// ================= LOAD (with queryState) =================

const loadOrdersByState = async () => {
  let query = `?_page = ${state.queryState.page}&_limit=10`;

  if (state.queryState.search) query += `&user_like=${state.queryState.search} `;
  if (state.queryState.status !== null) query += `&status=${state.queryState.status} `;
  if (state.queryState.sort !== null) query += `${state.queryState.sort} `;

  const { data, total } = await api.getOrdersByQuery(query);
  renderOrders(data);
  setPagination(total);
};

const debouncedLoadOrders = debounce(loadOrdersByState, 500)

const setPagination = (total) => {

  const paginationElm = document.querySelector(".pagination");
  if (!paginationElm) return;

  if (total <= 10) {
    paginationElm.classList.add("hidden");
    return;
  }

  paginationElm.classList.remove("hidden");

  if (!pager) {

    pager = new Pagination(paginationElm, {
      totalItems: total,
      perPage: 10,

      onChange: (page) => {
        queryState.page = page;
        loadUsersByState();
      }
    });

    return;
  }

  pager.update(total);
};

// ================= RENDER =================

const renderOrders = orders => {
  const wrapper = document.querySelector(".order-wrapper");
  if (!wrapper) return;
  let status;

  wrapper.innerHTML = "";
  if (orders.length == 0) {
    wrapper.insertAdjacentHTML("beforeend", `<td class="text-center py-5" colspan ="9" > چیزی برای نمایش وجود ندارد.</td > `)
  } else {
    orders.forEach(order => {
      status = order.status === "لغو شده" || order.status === "در انتظار پرداخت";
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
            <td>
              <div class="flex gap-x-2.5">
                <button type="button" class="btn btn-edit btn-download-order ${status ? "disable-btn" : ""}" ${status ? "disabled" : ""} data-id=${order.id}>
                  <svg class="size-5">
                    <use href="#download"></use>
                  </svg>
                </button>
                <span class="btn btn-delete btn-delete-order" data-id=${order.id}>
                  <svg class="size-5">
                    <use href="#delete"></use>
                  </svg>
                </span>
              </div>
            </td>
          </tr>
        `
      );
    });
  }
};

const renderModalOrders = orders => {
  modalProductWrapper.innerHTML = "";

  if (orders.length == 0) {
    modalProductWrapper.insertAdjacentHTML("beforeend",
      `
  <tr tr >
  <td colspan="4" class="p-3">محصولی انتخاب نشده.</td>
      </tr >
  `
    )
  } else {
    orders.forEach(order => {
      modalProductWrapper.insertAdjacentHTML("beforeend",
        `
  <tr tr class="border-t" >
            <td class="p-2">${order.productName}</td>
            <td class="p-2"> 
              <input
                type="number"
                value="1"
                class="qty w-16 border rounded text-center"/>
            </td>
            <td class="p-2">${order.productPrice.toLocaleString()}</td>
            <td class="p-2">
              <button data-id=${order.productId} class="text-red-500 remove">
                <svg class="size-5">
                  <use href="#x"></use>
                </svg>
                </button>
              </td>
          </tr >
  `
      );
    });
  }
}

// ================= inputs =================

const getInputValue = () => {
  const user = userSearchInput.value.trim();
  const userPhone = userPhoneInput.value.trim();
  const paymentMethod = paymentMethodInput.value.trim();
  const status = orderStatusInput.value.trim();
  const description = descriptionInput.value.trim();
  const totalPrice = totalPriceElm.innerHTML;

  return {
    user,
    userPhone,
    totalPrice,
    items: items,
    paymentMethod,
    createAt: Date.now(),
    purchaseAt: null,
    status: status,
    description
  };
};

const clearInputValue = () => {
  userSearchInput.value = "";
  userPhoneInput.value = "";
  productSearchInput.value = "";
  descriptionInput.value = "";
  totalPriceElm.value = "0";
};
