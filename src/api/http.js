const BASE_URL = "http://localhost:3000";

export const request = async (url, options = {}) => {

  const config = {
    ...options,
    headers: {
      ...(options.body instanceof FormData
        ? {}
        : { "Content-Type": "application/json" }),
      ...options.headers
    }
  };

  const res = await fetch(BASE_URL + url, config);

  // error handling
  if (!res.ok) {
    const message = await res.text();
    throw new Error(message || "API Error");
  }

  // pagination total
  const total = Number(res.headers.get("x-total-count"));

  // empty response check
  const data = res.status === 204 ? null : await res.json();

  return { data, total };
};
