import * as api from "../api/users.api.js";
import * as ui from "../ui/modal.js";
import * as utils from "../utils/toast.js";
import * as date from "../utils/date.js";
import * as state from "../utils/state.js";
import { Pagination } from "../utils/pagination.js";
import { debounce } from "../utils/debounce.js";
import { setCurrentPage } from "../utils/state.js";

const userNameInput = document.querySelector("#name-input");
const phoneInput = document.querySelector("#phone-input");
const emailInput = document.querySelector("#email-input");
const passwordInput = document.querySelector("#password-input");
const roleElm = document.querySelector("#role");

const submitBtn = document.querySelector(".submit-btn");
const closeBtn = document.querySelector(".danger-btn");

const confirmOk = document.getElementById("confirm-ok");
const confirmCancel = document.getElementById("confirm-cancel");

let userID;
let content;
let pager = null;

export const init = () => {
  content = document.getElementById("content");

  content.addEventListener("input", handleSearchInput);
  content.addEventListener("change", handleFilterChange);
  content.addEventListener("click", handleContentClick);

  submitBtn.addEventListener("click", handleSubmit);
  closeBtn.addEventListener("click", handleCloseModal);

  confirmOk.addEventListener("click", handleConfirmDelete);
  confirmCancel.addEventListener("click", ui.hideConfirmModal);

  ui.bindModalEvents("user");
  loadUsersByState();

  setCurrentPage("users");
};

export const destroy = () => {
  content.removeEventListener("input", handleSearchInput);
  content.removeEventListener("change", handleFilterChange);
  content.removeEventListener("click", handleContentClick);

  submitBtn.removeEventListener("click", handleSubmit);
  closeBtn.removeEventListener("click", handleCloseModal);

  confirmOk.removeEventListener("click", handleConfirmDelete);
  confirmCancel.removeEventListener("click", ui.hideConfirmModal);
  state.restState()
};

// ================= Handlers =================

const handleSearchInput = e => {
  if (e.target.id !== "search-box") return;

  queryState.search = e.target.value.trim();
  queryState.page = 1;
  debouncedLoadUsers();
};

const handleFilterChange = e => {
  if (e.target.id !== "user-filter") return;

  const val = e.target.value;
  state.queryState.page = 1;
  state.queryState.sort = null;
  state.queryState.status = null;

  if (val === "1") state.queryState.status = true;
  else if (val === "-1") state.queryState.status = false;
  else if (val === "date") state.queryState.sort = "&_sort=createAt&_order=desc";

  loadUsersByState();
};

const handleContentClick = async e => {
  const btn = e.target.closest(".btn-edit-user, .btn-delete-user, .create-user");
  if (!btn) return;

  if (btn.classList.contains("btn-edit-user")) {
    userID = btn.dataset.id;
    ui.showModal("ویرایش کاربر", "user");
    await setInputValue(userID);
    submitBtn.dataset.action = "update";
  }

  else if (btn.classList.contains("btn-delete-user")) {
    userID = btn.dataset.id;
    ui.showConfirmModal();
  }

  else if (btn.classList.contains("create-user")) {
    ui.showModal("ساخت کاربر جدید", "user");
    submitBtn.dataset.action = "create";
  }
};

const handleSubmit = async () => {
  const action = submitBtn.dataset.action;
  const userName = userNameInput.value;
  const userPhone = phoneInput.value;
  const password = passwordInput.value;
  const role = roleElm.value;
  
  if (!(userName, userPhone, password, role)) {
    utils.notify.error("لطفا تمامی فیلد هارا پر کنید.", "");
    return;
  }
  
  submitBtn.disabled = true;
  if (action === "update") {
    await api.updateUser(userID, getInputValue(true));
  } else {
    await api.createUser(getInputValue());
    utils.notify.success("کاربر با موفقیت ساخته شد.", "موفق");
  }

  loadUsersByState();
  ui.hideModal("user");
  clearInputValue();
  submitBtn.disabled = false;
};

const handleCloseModal = () => {
  ui.hideModal("user");
  clearInputValue();
};

const handleConfirmDelete = async () => {
  confirmOk.disabled = true;
  await api.deleteUser(+userID);
  const query = `?_page=${state.queryState.page}&_limit=10`;
  const { data } = await api.getUsersByQuery(query);

  if (data.length == 0) {
    if (queryState.page == 0) return;
    queryState.page--;
  }
  loadUsersByState();
  ui.hideConfirmModal();
  confirmOk.disabled = false;
};

// ================= LOAD (with queryState) =================

const loadUsersByState = async () => {
  let query = `?_page=${state.queryState.page}&_limit=10`;

  if (state.queryState.search) query += `&userName_like=${state.queryState.search}`;
  if (state.queryState.status !== null) query += `&status=${state.queryState.status}`;
  if (state.queryState.sort !== null) query += `${state.queryState.sort}`;

  const { data, total } = await api.getUsersByQuery(query);
  renderUsers(data);
  setPagination(total);
};

const debouncedLoadUsers = debounce(loadUsersByState, 500)

const setPagination = total => {

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

const renderUsers = users => {
  const wrapper = document.querySelector(".user-wrapper");
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
          <td>${user.role}</td>
          <td>${user.password}</td>
          <td>${date.formatJalaliDateTime(user.createAt)}</td>
          <td class="text-center">
            <span class="${user.status ? "active" : "not-active"}">
              ${user.status ? "فعال" : "غیرفعال"}
            </span>
          </td>
          <td>
            <div class="flex gap-x-2.5">
              <span class="btn btn-edit btn-edit-user" data-id=${user.id}>
                <svg class="size-5">
                  <use href="#edite"></use>
                </svg>
              </span>
              <span class="btn btn-delete btn-delete-user" data-id=${user.id}>
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
  const userName = userNameInput.value.trim();
  const phone = phoneInput.value.trim();
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();
  const role = roleElm.value.trim();

  return {
    userName,
    phone,
    email,
    password,
    role,
    ...(isUpdate ? {} : { createAt: Date.now() }),
    status: true
  };
};

const setInputValue = async id => {
  const { data } = await api.getUsersById(+id);
  userNameInput.value = data.userName;
  emailInput.value = data.email;
  passwordInput.value = data.password;
  roleElm.value = data.role;
  phoneInput.value = data.phone;
};

const clearInputValue = () => {
  userNameInput.value = "";
  emailInput.value = "";
  passwordInput.value = "";
  roleElm.value = "";
  phoneInput.value = "";
};
