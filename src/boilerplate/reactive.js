/**
 * Super simple HTML attribute based reactivity.
 * Does not do any sort of performance optimizations or queuing of reactions.
 * 
 * If you need something more powerful or performant for your applications,
 * consider using one of the more popular reactive component framework
 */
export class ReactiveElement extends HTMLElement {
    constructor() {
        super();

        this._reactive = [];

        const update = () => {
            this.beforeRender?.();
            this.innerHTML = this.render();
            this.afterRender?.();
        };

        new MutationObserver(
            (mutationsList, observer) => {
                let shouldUpdate = false;
                for (const mutation of mutationsList) {
                    if (this._reactive.includes(mutation.attributeName)) {
                        shouldUpdate = true;
                    }
                }

                if (shouldUpdate) {
                    update();
                }
            }
        ).observe(this, { attributes: true });

        setTimeout(update, 0);
    }
}

export function attr(target, name, { attributeName, get, set, value, reactive }) {
    Object.defineProperty(target, name, {
        get() {
            let htmlValue = target.getAttribute(attributeName ?? name);
            htmlValue = get?.(htmlValue) ?? htmlValue;
            return htmlValue;
        }, 
        set(raw) {
            const insert = set?.(raw) ?? raw;
            target.setAttribute(attributeName ?? name, insert);
        },
    });

    if (value) {
        target[name] = value;
    }

    if (target instanceof ReactiveElement && (reactive ?? true)) {
        target._reactive.push(attributeName ?? name);
    }
};
