import { request } from "./http.js";

export const getUsers = (page = 1, limit = 10) => request(`/users?_page=${page}&_limit=${limit}`);

export const getUsersById = id => request(`/users/${id}`);

export const searchUsers = q => request(`/users?userName_like=${q}`);

export const filterByStatus = status => request(`/users?status=${status}`);

export const sortByDate = order => request(`/users?_sort=createAt&_order=${order}`);

export const createUser = body => request("/users", { method: "POST", body: JSON.stringify(body) });

export const deleteUser = id => request(`/users/${id}`, { method: "DELETE" });

export const updateUser = (id, body) => request(`/users/${id}`, { method: "PATCH", body: JSON.stringify(body) });

export const getUsersByQuery = query => request(`/users${query}`);
