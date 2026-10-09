"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

export function ShowNotification() {
  const searchParams = useSearchParams();

  const [showNotification, setShowNotification] = useState<boolean>(false);

  useEffect(() => {
    const isRegistered = searchParams.get("registered") === "true";

    if (isRegistered) {
      setShowNotification(true);
    }
  }, [searchParams]);

  useEffect(() => {
    if (showNotification) {
      const timer = window.setTimeout(() => {
        setShowNotification(false);
      }, 5000);
      return () => window.clearTimeout(timer);
    }
  }, [showNotification]);

  if (!showNotification) return null;

  /*
   * Toast melayang. Sebelumnya `absolute` tanpa ancestor ber-position, jadi
   * tempatnya jatuh di paling atas dokumen - tertutup navbar yang sticky.
   * Sekarang `fixed` di bawah navbar dengan z di atasnya.
   */
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed left-1/2 top-24 z-[60] w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-center text-sm font-medium text-emerald-800 shadow-lg"
    >
      Registration was successful!
    </div>
  );
}
