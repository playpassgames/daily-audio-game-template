Array.from(document.querySelectorAll('[toggleable]')).forEach(e => {
    const toggle = (evt) => {
        evt.preventDefault();
        
        if (e.hasAttribute("open")) {
            e.removeAttribute("open");
            return false;
        } else {
            e.setAttribute("open", "");
            return true;
        }
    };

    const togglers = Array.from(document.querySelectorAll(`*[toggle=${e.id}`));


    togglers.forEach(toggler => {
        toggler.onclick = (e) => {
            const open = toggle(e);

            togglers.forEach(t => {
                if (!open) {
                    t.removeAttribute("open");
                } else {
                    t.setAttribute("open", "");
                }
            });
        };
    });
});
