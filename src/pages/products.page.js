import * as api from "../api/products.api.js";
import * as ui from "../ui/modal.js";
import * as utils from "../utils/toast.js";
import * as state from "../utils/state.js";
import { Pagination } from "../utils/pagination.js";
import { debounce } from "../utils/debounce.js";
import { formatJalaliDateTime } from "../utils/date.js";
import { setCurrentPage } from "../utils/state.js";

// ================= Elements =================

const productName = document.querySelector("#product-name");
const productQty = document.querySelector("#product-qty");
const productOffer = document.querySelector("#product-offer");
const productPrice = document.querySelector("#product-price");
const productCategory = document.querySelector("#product-category");
const productDescription = document.querySelector("#product-description");
const productCover = document.getElementById("product-cover");
const productImage = document.getElementById("product-image");
const productImg = document.getElementById("preview");

const submitBtn = document.querySelector(".submit-btn");
const closeBtn = document.querySelector(".danger-btn");

const confirmOk = document.getElementById("confirm-ok");
const confirmCancel = document.getElementById("confirm-cancel");

let content;
let productID;
let imageURL;
let pager = null;

// ================= INIT / DESTROY =================

export const init = () => {
  content = document.getElementById("content");

  content.addEventListener("input", handleSearchInput);
  content.addEventListener("change", handleFilterChange);
  content.addEventListener("click", handleContentClick);

  submitBtn.addEventListener("click", handleSubmit);
  closeBtn.addEventListener("click", handleCloseModal);
  productCover.addEventListener("change", handleCoverChange);

  confirmOk.addEventListener("click", handleConfirmDelete);
  confirmCancel.addEventListener("click", ui.hideConfirmModal);

  ui.bindModalEvents("product");
  loadProductsByState();
  setCurrentPage("products")
};

export const destroy = () => {
  content.removeEventListener("input", handleSearchInput);
  content.removeEventListener("change", handleFilterChange);
  content.removeEventListener("click", handleContentClick);

  submitBtn.removeEventListener("click", handleSubmit);
  closeBtn.removeEventListener("click", handleCloseModal);
  productCover.removeEventListener("change", handleCoverChange);

  confirmOk.removeEventListener("click", handleConfirmDelete);
  confirmCancel.removeEventListener("click", ui.hideConfirmModal);

  state.restState()
};

// ================= Handlers =================

const handleSearchInput = e => {
  if (e.target.id !== "search-box") return;

  console.log(e);
  state.queryState.search = e.target.value.trim();
  state.queryState.page = 1;
  debouncedLoadProduct();
};

const handleFilterChange = e => {
  if (e.target.id !== "products-filter") return;

  const val = e.target.value;

  state.queryState.page = 1;
  state.queryState.sort = null;
  state.queryState.status = null;

  if (val === "1") state.queryState.status = true;
  else if (val === "-1") state.queryState.status = false;
  else if (val === "date") state.queryState.sort = "&_sort=createdAt&_order=desc";
  else if (val === "p-asc") state.queryState.sort = "&_sort=price&_order=asc";
  else if (val === "p-desc") state.queryState.sort = "&_sort=price&_order=desc";

  loadProductsByState();
};

const handleContentClick = async e => {
  const btn = e.target.closest(".btn-edit-product, .btn-delete-product, .create-product");
  if (!btn) return;

  if (btn.classList.contains("btn-edit-product")) {
    productID = btn.dataset.id;
    ui.showModal("ویرایش محصول", "product");
    await setInputValue(productID);
    submitBtn.dataset.action = "update";
  }

  else if (btn.classList.contains("btn-delete-product")) {
    productID = btn.dataset.id;
    ui.showConfirmModal();
  }

  else if (btn.classList.contains("create-product")) {
    ui.showModal("ساخت محصول جدید", "product");
    submitBtn.dataset.action = "create";
  }
};

const handleSubmit = async () => {
  const action = submitBtn.dataset.action;
  
  if (!productCategory.value || !productName.value || (isNaN(productQty.value) || !productQty.value)) {
    utils.notify.error("فیلد های نام محصول، تعداد محصول و دسته بندی نمیتواند خالی باشد.", "");
    return;
  }
  
  submitBtn.disabled = true;
  if (action === "update") {
    await api.updateProduct(productID, getInputValue(true));
    utils.notify.success("محصول با موفقیت ویرایش شد.", "موفق");
  } else {
    await api.createProduct(getInputValue());
    utils.notify.success("محصول با موفقیت ساخته شد.", "موفق");
  }

  loadProductsByState();
  ui.hideModal("product");
  clearInputValue();
  submitBtn.disabled = false;
};

const handleCloseModal = () => {
  ui.hideModal("product");
  clearInputValue();
};

const handleConfirmDelete = async () => {
  confirmOk.disabled = true;
  await api.deleteProduct(+productID);
  const query = `?_page=${state.queryState.page}&_limit=10`;
  const { data } = await api.getProductsByQuery(query);

  if (data.length == 0) {
    if (state.queryState.page == 0) return;
    state.queryState.page--;
  }
  loadProductsByState();
  ui.hideConfirmModal();
  confirmOk.disabled = false;
};

const handleCoverChange = async () => {
  const file = productCover.files[0];
  if (!file) return;

  productImage.textContent = file.name;
  imageURL = await toBase64(file);
  productImg.src = imageURL;
};

// ================= LOAD =================

const loadProductsByState = async () => {
  let query = `?_page=${state.queryState.page}&_limit=10`;

  if (state.queryState.search) query += `&name_like=${state.queryState.search}`;
  if (state.queryState.status !== null) query += `&status=${state.queryState.status}`;
  if (state.queryState.sort !== null) query += `${state.queryState.sort}`;

  const { data, total } = await api.getProductsByQuery(query);

  renderProduct(data);
  setPagination(total)
};

const debouncedLoadProduct = debounce(loadProductsByState, 500)

const setPagination = (total) => {

  const paginationElm = document.querySelector(".pagination");
  if (!paginationElm) return;

  // اگر آیتم کم بود pagination مخفی شود
  if (total <= 10) {
    paginationElm.classList.add("hidden");
    return;
  }

  paginationElm.classList.remove("hidden");

  // اگر اولین بار است pagination ساخته شود
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

  // اگر قبلا ساخته شده فقط update کن
  pager.update(total);
};

// ================= RENDER =================

const renderProduct = products => {
  const wrapper = document.querySelector(".product-wrapper");
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
        <td>${formatJalaliDateTime(product.createdAt)}</td>
        <td>${product.qty} عدد</td>
        <td>${product.offer}%</td>
        <td>
          <span class="${product.status ? "active" : "not-active"}">
            ${product.status ? "فعال" : "غیرفعال"}
          </span>
        </td>
        <td>
            <div class="flex gap-x-2.5">
              <span class="btn btn-edit btn-edit-product" data-id=${product.id}>
                <svg class="size-5">
                  <use href="#edite"></use>
                </svg>
              </span>
              <span class="btn btn-delete btn-delete-product" data-id=${product.id}>
                <svg class="size-5">
                  <use href="#delete"></use>
                </svg>
              </span>
            </div>
          </td>
      </tr>
    `);
  });
};

// ================= Inputs =================

const getInputValue = (isUpdate = false) => ({
  name: productName.value.trim(),
  price: Number(productPrice.value),
  category: productCategory.value.trim(),
  offer: Number(productOffer.value),
  qty: Number(productQty.value),
  description: productDescription.value.trim(),
  img: imageURL || productImg.src,
  status: Number(productQty.value) == 0 ? false : true,
  ...(isUpdate ? {} : { createdAt: Date.now() })
});

const setInputValue = async id => {
  const { data } = await api.getProductsById(+id);

  productName.value = data.name;
  productPrice.value = data.price;
  productDescription.value = data.description;
  productCategory.value = data.category;
  productQty.value = data.qty;
  productOffer.value = data.offer;
  productImg.src = data.img || "/img/images.png";
};

const clearInputValue = () => {
  productName.value = "";
  productPrice.value = "";
  productCategory.value = "";
  productDescription.value = "";
  productQty.value = "";
  productOffer.value = "";
  productImg.src = "/img/images.png";
  productImage.textContent = "فایلی انتخاب نشده";
};

// ================= Utils =================

const toBase64 = file =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
  });
