import * as api from "../api/coupons.api.js";
import * as ui from "../ui/modal.js";
import * as utils from "../utils/toast.js";
import * as date from "../utils/date.js";
import * as state from "../utils/state.js";
import { Pagination } from "../utils/pagination.js";
import { debounce } from "../utils/debounce.js";
import { setCurrentPage } from "../utils/state.js";

const couponName = document.querySelector("#coupon-input");
const descriptionInput = document.querySelector("#description-input");
const expireTimeInput = document.querySelector("#expireTime");
const qtyInput = document.querySelector("#qty-input");
const categoryInput = document.querySelector("#category-input");

const submitBtn = document.querySelector(".submit-btn");
const closeBtn = document.querySelector(".danger-btn");

const confirmOk = document.getElementById("confirm-ok");
const confirmCancel = document.getElementById("confirm-cancel");

let couponID;
let content;

export const init = () => {
  content = document.getElementById("content");

  content.addEventListener("input", handleSearchInput);
  content.addEventListener("change", handleFilterChange);
  content.addEventListener("click", handleContentClick);

  submitBtn.addEventListener("click", handleSubmit);
  closeBtn.addEventListener("click", handleCloseModal);

  confirmOk.addEventListener("click", handleConfirmDelete);
  confirmCancel.addEventListener("click", ui.hideConfirmModal);

  ui.bindModalEvents();
  loadCouponsByState();
  setCurrentPage("orders");
};

export const destroy = () => {
  content.removeEventListener("input", handleSearchInput);
  content.removeEventListener("change", handleFilterChange);
  content.removeEventListener("click", handleContentClick);

  submitBtn.removeEventListener("click", handleSubmit);
  closeBtn.removeEventListener("click", handleCloseModal);

  confirmOk.removeEventListener("click", handleConfirmDelete);
  confirmCancel.removeEventListener("click", ui.hideConfirmModal);

  state.restState();
};

// ================= Handlers =================


const handleSearchInput = e => {
  if (e.target.id !== "search-box") return;

  state.queryState.search = e.target.value.trim();
  state.queryState.page = 1;
  debouncedLoadCoupons()
};

const handleFilterChange = e => {
  if (e.target.id !== "coupon-filter") return;

  const val = e.target.value;

  state.queryState.page = 1;
  state.queryState.sort = null;
  state.queryState.status = null;

  if (val === "1") state.queryState.status = true;
  else if (val === "-1") state.queryState.status = false;
  else if (val === "date") state.queryState.sort = "&_sort=createAt&_order=desc";

  console.log(state.queryState);
  loadCouponsByState();
};

const handleContentClick = async e => {
  const btn = e.target.closest(".btn-edit-coupon, .btn-delete-coupon, .create-coupon");
  if (!btn) return;

  if (btn.classList.contains("btn-edit-coupon")) {
    couponID = btn.dataset.id;
    ui.showModal("ویرایش کاربر", "coupon");
    await setInputValue(couponID);
    submitBtn.dataset.action = "update";
  }

  else if (btn.classList.contains("btn-delete-coupon")) {
    couponID = btn.dataset.id;
    ui.showConfirmModal();
  }

  else if (btn.classList.contains("create-coupon")) {
    ui.showModal("ساخت کاربر جدید", "coupon");
    submitBtn.dataset.action = "create";
  }
};

const handleSubmit = async () => {
  const action = submitBtn.dataset.action;

  if ((couponName.value && expireTimeInput.value && qtyInput.value) == "") {
    utils.notify.error("لطفا فیلد های نام کد تخفیف، تاریخ انقضا و تعداد کد تخفیف را پرکنید.", "");
    return;
  }

  submitBtn.disabled = true;
  if (action === "update") {
    await api.updateCoupon(couponID, getInputValue(true));
    utils.notify.success("کد تخفیف با موفقیت بروز شد.", "موفق")
  } else {
    await api.createCoupon(getInputValue());
    utils.notify.success("کد تخفیف با موفقیت ساخته شد.", "موفق");
  }

  loadCouponsByState();
  ui.hideModal("coupon");
  clearInputValue();
  submitBtn.disabled = false;
};

const handleCloseModal = () => {
  ui.hideModal("coupon");
  clearInputValue();
};

const handleConfirmDelete = async () => {
  confirmOk.disabled = true;
  await api.deleteCoupon(+couponID);
  loadCouponsByState();
  ui.hideConfirmModal();
  confirmOk.disabled = false;
};

// ================= LOAD (with queryState) =================

const loadCouponsByState = async () => {
  let query = `?_page=${state.queryState.page}&_limit=10`;

  if (state.queryState.search) query += `&coupon_like=${state.queryState.search}`;
  if (state.queryState.status !== null) query += `&status=${state.queryState.status}`;
  if (state.queryState.sort !== null) query += `${state.queryState.sort}`;

  const { data, total } = await api.getCouponsByQuery(query);

  renderCoupons(data);
  setPagination(total)
};

const debouncedLoadCoupons = debounce(loadCouponsByState, 500)

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
        state.queryState.page = page;
        loadProductsByState();
      }
    });

    return;
  }

  pager.update(total);
};

// ================= RENDER =================

const renderCoupons = coupons => {
  const wrapper = document.querySelector(".coupon-wrapper");
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
            <div class="line-clamp-3">${coupon.description || "..."}</div>
          </td>
          <td class="">${date.formatJalaliDateTime(coupon.createAt)}</td>
          <td class="">${date.formatJalaliDateTime(coupon.expireAt)}</td>
          <td class="">${coupon.category || "همه دسته بندی ها"}</td>
          <td class="">${coupon.qty}</td>
          <td class="">${coupon.used}</td>
          <td class="text-cenetr">
            <span class="${coupon.status ? "active" : "not-active"}">
              ${coupon.status ? "فعال" : "غیرفعال"}
            </span>
          </td>
          <td>
            <div class="flex gap-x-2.5">
              <span class="btn btn-edit btn-edit-coupon" data-id="${coupon.id}">
                <svg class="size-5">
                  <use href="#edite"></use>
                </svg>
              </span>
              <span class="btn btn-delete btn-delete-coupon" data-id="${coupon.id}">
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

// ================= inputs =================
const getInputValue = (isUpdate = false) => {
  const coupon = couponName.value.trim();
  const description = descriptionInput.value.trim();
  const qty = qtyInput.value.trim();
  const category = categoryInput.value.trim();
  const expireTimeStr = expireTimeInput.value.trim();
  const expireAt = date.jalaliToTimestamp(expireTimeStr);

  return {
    coupon,
    description,
    qty,
    used: 0,
    category,
    expireAt,
    ...(isUpdate ? {} : { createAt: Date.now() }),
    status: true
  };
};

const setInputValue = async id => {
  const { data } = await api.getCouponById(+id);
  couponName.value = data.coupon;
  descriptionInput.value = data.description;
  categoryInput.value = data.category;
  qtyInput.value = data.qty;
  expireTimeInput.value = date.formatJalali(data.expireAt);
};

const clearInputValue = () => {
  couponName.value = "";
  descriptionInput.value = "";
  categoryInput.value = "";
  qtyInput.value = "";
  expireTimeInput.value = "";
};
