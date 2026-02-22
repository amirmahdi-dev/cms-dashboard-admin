let modal;
let modalBox;
let titleElm;
let modalInputs;
let overlay;
let confirmModal;
let confirmModalBox;

const cacheDOM = modalOpen => {
    modal = document.getElementById("modal");
    modalBox = document.getElementById("modal-box");
    titleElm = document.getElementById("title");
    modalInputs = document.querySelector(`[data-open-modal="${modalOpen}"]`);
    overlay = document.querySelector(`.overlay`);
};

export const showModal = (title, modalOpen) => {
    cacheDOM(modalOpen);
    titleElm.innerHTML = title;
    modalInputs.classList.remove("hidden");
    modal.classList.remove("hidden");
    overlay.classList.add("overlay--show");
    overlay.classList.add("z-200");

    requestAnimationFrame(() => {
        modalBox.classList.remove("opacity-0", "scale-95");
        modalBox.classList.add("opacity-100", "scale-100");
    });
};

export const hideModal = modalOpen => {
    cacheDOM(modalOpen);

    modalBox.classList.add("opacity-0", "scale-95");
    modalBox.classList.remove("opacity-100", "scale-100");
    overlay.classList.remove("overlay--show");
    overlay.classList.remove("z-200");
    modalInputs.classList.add("hidden");

    setTimeout(() => {
        modal.classList.add("hidden");
    }, 300); // duration transition
};

export const bindModalEvents = (modalOpen) => {
    cacheDOM(modalOpen);

    modal.addEventListener("click", e => {
        if (e.target === modal) hideModal(modalOpen);
    });

    document.addEventListener("keydown", e => {
        if (e.key === "Escape") hideModal(modalOpen);
    });
};

export const showConfirmModal = () => {
    confirmModal = document.getElementById("confirm-modal");
    confirmModalBox = document.getElementById("confirm-modal-box");

    confirmModal.classList.remove("hidden");
    overlay.classList.add("overlay--show");

    requestAnimationFrame(() => {
        confirmModalBox.classList.remove("opacity-0", "scale-95");
        confirmModalBox.classList.add("opacity-100", "scale-100");
    });
}

export const hideConfirmModal = () => {
    confirmModal = document.getElementById("confirm-modal");
    confirmModalBox = document.getElementById("confirm-modal-box");

    confirmModal.classList.add("hidden");
    overlay.classList.remove("overlay--show");

    requestAnimationFrame(() => {
        confirmModalBox.classList.add("opacity-0", "scale-95");
        confirmModalBox.classList.remove("opacity-100", "scale-100");
    });
}