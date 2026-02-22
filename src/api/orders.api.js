import { request } from "./http.js";

export const getOrders = (page = 1, limit = 10) => request(`/orders?_page=${page}&_limit=${limit}`);

export const getOrderById = id => request(`/orders/${id}`);

export const searchOrders = q => request(`/orders?userName_like=${q}`);

export const filterByStatus = status => request(`/orders?status=${status}`);

export const sortByDate = order => request(`/orders?_sort=createAt&_order=${order}`);

export const createOrder = body => request("/orders", { method: "POST", body: JSON.stringify(body) });

export const deleteOrder = id => request(`/orders/${id}`, { method: "DELETE" });

export const updateOrder = (id, body) => request(`/orders/${id}`, { method: "PATCH", body: JSON.stringify(body) });

export const getOrdersByQuery = query => request(`/orders${query}`);
