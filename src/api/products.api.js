import { request } from "./http.js";

export const getProducts = (page = 1, limit = 10) => request(`/products?_page=${page}&_limit=${limit}`);

export const getProductsById = id => request(`/products/${id}`);

export const searchProducts = q => request(`/products?userName_like=${q}`);

export const filterByStatus = status => request(`/products?status=${status}`);

export const sortByDate = order => request(`/products?_sort=createAt&_order=${order}`);

export const createProduct = body => request("/products", { method: "POST", body: JSON.stringify(body) });

export const deleteProduct = id => request(`/products/${id}`, { method: "DELETE" });

export const updateProduct = (id, body) => request(`/products/${id}`, { method: "PATCH", body: JSON.stringify(body) });

export const getProductsByQuery = query => request(`/products${query}`);
