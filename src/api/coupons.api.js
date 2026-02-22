import { request } from "./http.js";

export const getCoupons = (page = 1, limit = 10) => request(`/coupons?_page=${page}&_limit=${limit}`);

export const getCouponById = id => request(`/coupons/${id}`);

export const searchCoupons = q => request(`/coupons?userName_like=${q}`);

export const filterByStatus = status => request(`/coupons?status=${status}`);

export const sortByDate = order => request(`/coupons?_sort=createAt&_order=${order}`);

export const createCoupon = body => request("/coupons", { method: "POST", body: JSON.stringify(body) });

export const deleteCoupon = id => request(`/coupons/${id}`, { method: "DELETE" });

export const updateCoupon = (id, body) => request(`/coupons/${id}`, { method: "PATCH", body: JSON.stringify(body) });

export const getCouponsByQuery = query => request(`/coupons${query}`);
