"use client";

import { useState, useEffect, forwardRef, useImperativeHandle } from "react";

export interface ToastRef {
  show: (message: string, duration?: number) => void;
}

export const Toast = forwardRef<ToastRef, {}>((_, ref) => {
  const [message, setMessage] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);

  useImperativeHandle(ref, () => ({
    show(msg: string, duration = 2500) {
      setMessage(msg);
      setVisible(true);

      const timer = setTimeout(() => {
        setVisible(false);
      }, duration);

      return () => clearTimeout(timer);
    },
  }));

  if (!message) return null;

  return (
    <div
      className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-[var(--radius-md)] border border-white/10 bg-[var(--color-bg-dark)]/90 backdrop-blur-md text-[var(--color-ink-dark)] font-display text-sm font-medium tracking-tight shadow-xl shadow-black/30 transition-all duration-300 pointer-events-none ${
        visible
          ? "translate-y-0 opacity-100 scale-100"
          : "translate-y-4 opacity-0 scale-95"
      }`}
    >
      <div className="flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-accent)] animate-pulse" />
        {message}
      </div>
    </div>
  );
});

Toast.displayName = "Toast";
export default Toast;
