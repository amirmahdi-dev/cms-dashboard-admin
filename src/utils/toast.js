class ToastManager {
    constructor() {
        this.defaultConfig = {
            duration: 5000,
            position: "top-left",
            rtl: true,
        };

        this.positions = {
            "top-right": "top:3%; right:3%;",
            "top-left": "top:3%; left:3%;",
            "bottom-right": "bottom:3%; right:3%;",
            "bottom-left": "bottom:3%; left:3%;"
        };
    }

    setConfig({ message, title, type, icon, ...opt }) {
        return {
            ...this.defaultConfig,
            message,
            title,
            type,
            icon,
            ...opt
        };
    }

    success({ message, title, ...opt }) {
        const config = this.setConfig({
            message,
            title,
            type: "success",
            icon: "check",
            ...opt
        });

        this.show(config);
    }

    error({ message, title, ...opt }) {
        const config = this.setConfig({
            message,
            title,
            type: "error",
            icon: "error",
            ...opt
        });

        this.show(config);
    }

    createToast(config) {
        const toast = document.createElement("div");

        toast.className = `
            toast-box
            opacity-0 translate-y-4 transition-all duration-300
        `;

        toast.style = this.positions[config.position];

        toast.innerHTML = `
            <div class="toast flex gap-3 items-center">
                <div class="size-12 shrink-0">
                    <svg class="w-full h-full text-${config.type}">
                        <use href="#${config.icon}"></use>
                    </svg>
                </div>

                <div class="flex flex-col">
                    <h1 class="font-bold">${config.title}</h1>
                    <p>${config.message}</p>
                </div>
            </div>

            <div class="w-full h-2 bg-${config.type}"></div>
        `;

        return toast;
    }

    show(config) {
        const toast = this.createToast(config);

        document.body.appendChild(toast);

        // انیمیشن ورود
        requestAnimationFrame(() => {
            toast.classList.remove("opacity-0", "translate-y-4");
        });

        this.autoRemove(toast, config.duration)
    }

    autoRemove(toast, duration) {
        return setTimeout(() => {
            toast.classList.add("opacity-0", "translate-y-4");

            setTimeout(() => {
                toast.remove();
            }, 300);
        }, duration);
    }
}

const toast = new ToastManager();

export const notify = {
    success: (msg, title, o = {}) => toast.success({ message: msg, title, ...o }),
    error: (msg, title, o = {}) => toast.error({ message: msg, title, ...o }),
};
