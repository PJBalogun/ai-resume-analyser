type ErrorDetails = { message: string; code: string };

function readError(value: unknown, depth = 0): ErrorDetails {
    if (typeof value === 'string') return { message: value, code: value };
    if (!value || typeof value !== 'object' || depth > 4) return { message: '', code: '' };
    const data = value as Record<string, unknown>;
    const nested = readError(data.error ?? data.cause, depth + 1);
    const message = typeof data.message === 'string' ? data.message
        : typeof data.msg === 'string' ? data.msg : nested.message;
    const code = typeof data.code === 'string' ? data.code : nested.code;
    return { message, code };
}

export function serviceErrorMessage(error: unknown, fallback: string): string {
    const { message, code } = readError(error);
    const signature = `${code} ${message}`.toLowerCase();
    if (signature.includes('popup_blocked')) {
        return 'The sign-in popup was blocked. Allow popups for this site and click Continue with Puter again. If the in-app browser blocks it, open this same localhost URL in Chrome or Edge.';
    }
    if (signature.includes('auth_window_closed')) {
        return 'The sign-in window was closed before sign-in finished. Please reopen it and complete sign-in.';
    }
    if (signature.includes('unsupported_origin')) {
        return 'This browser cannot complete Puter sign-in here. Open this same localhost URL in Chrome or Edge and try again.';
    }
    const detail = message || code;
    if (!detail) return fallback;
    return code && code !== message && !message.includes(code)
        ? `${message || fallback} (${code})` : detail;
}
