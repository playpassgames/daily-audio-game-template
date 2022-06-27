import "./modal.css";

Array.from(document.querySelectorAll('.modal')).forEach(
    (element) => {
        element.querySelector(".modal-fade").onclick = (e) => {
            e.stopPropagation();
            e.preventDefault();
            element.hide();
        };

        element.querySelector("form")?.addEventListener('submit', (e) => {
            e.preventDefault();
            element.hide();
        });

        element.show = () => {
            element.dispatchEvent(new CustomEvent("open"))
            element.setAttribute("open", "");
        }

        element.hide = () => {
            element.removeAttribute("open");
        }

        element.toggle = () => {
            if (element.hasAttribute("open")) {
                element.hide();
            } else {
                element.show();   
            }
        }
    }
);
