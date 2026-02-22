export class Pagination {
    constructor(container, { totalItems, perPage = 10, onChange }) {
        this.container = container;
        this.totalItems = totalItems;
        this.perPage = perPage;
        this.onChange = onChange;

        this.MAX_VISIBLE = 6;
        this.currentPage = 1;
        this.totalPages = Math.ceil(totalItems / perPage);

        this.pagesEl = container.querySelector(".pages");
        this.nextBtn = container.querySelector(".next-btn");
        this.preBtn = container.querySelector(".pre-btn");

        if (!this.pagesEl || !this.nextBtn || !this.preBtn) return;

        this.bindEvents();
        this.render();
    }

    bindEvents() {
        this.nextBtn.onclick = () => this.goNext();
        this.preBtn.onclick = () => this.goPrev();
    }

    goNext() {
        if (this.currentPage < this.totalPages) {
            this.currentPage++;
            this.triggerChange();
        }
    }

    goPrev() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.triggerChange();
        }
    }

    goTo(page) {
        this.currentPage = page;
        this.triggerChange();
    }

    triggerChange() {
        this.onChange?.(this.currentPage);
        this.render();
    }

    render() {
        this.pagesEl.innerHTML = "";

        this.toggleButtons();

        let start = Math.max(
            1,
            this.currentPage - Math.floor(this.MAX_VISIBLE / 2)
        );

        let end = start + this.MAX_VISIBLE - 1;

        if (end > this.totalPages) {
            end = this.totalPages;
            start = Math.max(1, end - this.MAX_VISIBLE + 1);
        }

        for (let i = start; i <= end; i++) {
            const page = document.createElement("span");

            page.className = "page";
            page.textContent = i;

            if (i === this.currentPage) {
                page.classList.add("page-active");
            }

            page.onclick = () => this.goTo(i);

            this.pagesEl.appendChild(page);
        }
    }

    toggleButtons() {
        this.nextBtn.classList.toggle(
            "hidden",
            this.currentPage === this.totalPages
        );

        this.preBtn.classList.toggle(
            "hidden",
            this.currentPage === 1
        );
    }

    update(totalItems) {
        console.log(totalItems);
        this.totalItems = totalItems;
        this.totalPages = Math.ceil(totalItems / this.perPage);

        if (this.currentPage > this.totalPages) {
            this.currentPage = this.totalPages || 1;
        }

        this.render();
    }
}
