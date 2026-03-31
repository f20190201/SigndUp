function isVisible(el: HTMLElement) {
    return !!(
        el.offsetWidth ||
        el.offsetHeight ||
        el.getClientRects().length
    );
}

function scoreInputFields(input: HTMLInputElement, credType: string): number {
    let score = 0;

    const name = input.name?.toLowerCase() || "";
    const id = input.id?.toLowerCase() || "";
    const placeholder = input.placeholder?.toLowerCase() || "";
    const type = input.type?.toLowerCase() || "";

    if (type === credType) score += 50;
    if (name === credType) score += 40;
    if (id === credType) score += 40;

    if (name.includes(credType)) score += 20;
    if (id.includes(credType)) score += 20;
    if (placeholder.includes(credType)) score += 20;

    const form = input.closest("form");
    if (form) {
        const formText = form.innerText.toLowerCase();

        if (formText.includes("login")) score += 15;
        if (formText.includes("sign in")) score += 15;
        if (formText.includes("signup")) score += 15;
    }

    if (name.includes("reset")) score -= 30;
    if (name.includes("search")) score -= 20;
    if (name.includes("newsletter")) score -= 25;

    if (!isVisible(input)) score -= 100;
    if (input.disabled) score -= 100;

    return score;
}

function getBestInput(inputs: HTMLInputElement[], credType: string): HTMLInputElement | null {
    let best: HTMLInputElement | null = null;
    let bestScore = -Infinity;

    for (const input of inputs) {
        const score = scoreInputFields(input, credType);

        if (score > bestScore) {
            bestScore = score;
            best = input;
        }
    }

    return bestScore > 0 ? best : null;
}


function msgToUi(flags: { emailFilled: boolean, passwordFilled: boolean, emailFieldFound: boolean, passwordFieldFound: boolean }) {
    if (flags.emailFilled && flags.passwordFilled) {
        return { result: "SUCCESS", message: "Autofilled successfully" }
    } else if (flags.emailFilled) {
        return { result: "PARTIAL", message: "Email autofilled successfully" }
    } else if (flags.passwordFilled) {
        return { result: "PARTIAL", message: "Password autofilled successfully" }
    } else {
        return { result: "FAILED", message: "Sorry, couldn't identify fields to autofill" }
    }
}

function setNativeValue(element: HTMLInputElement, value: string) {
    const prototype = Object.getPrototypeOf(element);

    const descriptor = Object.getOwnPropertyDescriptor(prototype, "value");

    const setter = descriptor?.set;
    element.focus();
    element.dispatchEvent(new Event("beforeinput", { bubbles: true }));
    if (setter) {
        setter.call(element, value);
    } else {
        element.value = value;
    }
    element.dispatchEvent(new Event("input", { bubbles: true }));
    element.dispatchEvent(new Event("change", { bubbles: true }));
    element.blur();

    return element.value === value
}


function getCredsFields() {
    const emailInput = [
        ...document.querySelectorAll<HTMLInputElement>('input[type="email"]'),
        ...document.querySelectorAll<HTMLInputElement>('input[name*="email"]'),
        ...document.querySelectorAll<HTMLInputElement>('input[placeholder*="email"]')
    ];

    const passwordInput = [
        ...document.querySelectorAll<HTMLInputElement>('input[type="password"]'),
        ...document.querySelectorAll<HTMLInputElement>('input[name*="password"]'),
        ...document.querySelectorAll<HTMLInputElement>('input[placeholder*="password"]')
    ];

    const bestEmailInput = getBestInput(emailInput, "email");
    const bestPasswordInput = getBestInput(passwordInput, "password");

    return { emailInput: bestEmailInput, passwordInput: bestPasswordInput };
}

export function findAndPopulateCredsFields(email: string, password: string) {
    const { emailInput, passwordInput } = getCredsFields();
    let flags = { emailFilled: false, passwordFilled: false, emailFieldFound: false, passwordFieldFound: false };
    if (emailInput) {
        flags.emailFilled = setNativeValue(emailInput, email);
        flags.emailFieldFound = true;
    }
    if (passwordInput) {
        flags.passwordFilled = setNativeValue(passwordInput, password);
        flags.passwordFieldFound = true;
    }
    return msgToUi(flags);
}



