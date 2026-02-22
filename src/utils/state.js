export const queryState = {
  page: 1,      //  current page
  search: "",
  status: null, // true (active) | false (not-active) | null (all)
  sort: null    // optional
};

export const restState = () => {
  queryState.page = 1;
  queryState.search = "";
  queryState.status = null;
  queryState.sort = null;
}

export const loadCurrentPage = () => {
  const currentPage = localStorage.getItem("page") || "dashboard";
  return currentPage;
}

export const setCurrentPage = (page = "dashboard") => {
  localStorage.setItem("page", page);
}