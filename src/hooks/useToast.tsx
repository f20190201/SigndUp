import { useState, useCallback } from "react";

export type ToastType = "success" | "error" | "warning" | "info";

const toastColors = {
    success: "bg-green-500",
    error: "bg-red-500",
    warning: "bg-yellow-500",
    info: "bg-blue-500",
};

export function useToast() {
    const [message, setMessage] = useState<{ message: string, type: ToastType } | null>(null);

    const showToast = useCallback((msg: string, type: ToastType = "info") => {
        setMessage({ message: msg, type });
    }, []);

    const Toast = () => {
        if (!message) return null;

        return (
            <div
                onAnimationEnd={() => setMessage(null)}
                style={{ width: "85%" }}
                className={`fixed bottom-5 left-1/2 -translate-x-1/2 
        px-3 py-2 rounded-lg text-white text-sm shadow-lg text-center
        animate-toast ${toastColors[message.type]}`}
            >
                {message.message}
            </div>
        );
    };

    return { showToast, Toast };
}