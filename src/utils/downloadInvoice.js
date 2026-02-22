import html2pdf from "html2pdf.js";
import * as date from "../utils/date.js";

export const downloadInvoice = async (order) => {

  // ساخت کانتینر مخفی خارج از UI
  const wrapper = document.createElement("div");

  wrapper.style.position = "fixed";
  wrapper.style.top = "-9999px";
  wrapper.style.left = "-9999px";

  wrapper.innerHTML = `
    <div id="invoice" class="w-full h-full bg-white text-black font-dana">

      <h1 class="text-2xl font-bold mb-6">فاکتور خرید</h1>

      <div class="mb-6 space-y-2">
        <p>شماره سفارش: ${order.id}</p>
        <p>نام مشتری: ${order.user}</p>
        <p>تاریخ: ${date.formatFullJalali(order.createAt)}</p>
      </div>

      <table class="w-full border border-gray-300">
        <thead class="bg-gray-100">
          <tr>
            <th class="border p-2">محصول</th>
            <th class="border p-2">تعداد</th>
            <th class="border p-2">قیمت</th>
          </tr>
        </thead>

        <tbody>
          ${order.items.map(item => `
            <tr>
              <td class="border p-2">${item.productName}</td>
              <td class="border p-2">${item.qty}</td>
              <td class="border p-2">
                ${item.productPrice.toLocaleString()} تومان
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>

      <div class="mt-6 text-lg font-bold">
        مبلغ کل: ${order.totalPrice.toLocaleString()} تومان
      </div>

    </div>
  `;

  document.body.appendChild(wrapper);

  const invoiceElement = wrapper.querySelector("#invoice");

  await html2pdf().set({
    margin: [5, 5, 5, 5],
    filename: `invoice-${order.id}.pdf`,
    image: { type: "jpeg", quality: 1 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
  }).from(invoiceElement).save();

  // حذف بعد از دانلود
  document.body.removeChild(wrapper);
};
