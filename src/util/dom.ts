// JavaScript utility function to wait for an element using MutationObserver
// Usage: await waitForElement(selector)
export function waitForElement(selector, timeout = Infinity): Promise<Element | null> {
    return new Promise(resolve => {
        if (timeout !== Infinity) {
            setTimeout(() => {
                resolve(null);
            }, timeout);
        }
        // Check if element already exists
        const el = document.querySelector(selector);
        if (el) {
            resolve(el);
            return;
        }

        const observer = new MutationObserver((mutations, obs) => {
            const element = document.querySelector(selector);
            if (element) {
                obs.disconnect();
                resolve(element);
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
        });
    });
}
