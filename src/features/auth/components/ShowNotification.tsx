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

  return (
    <div className="flex flex-col gap-4">
      {showNotification && (
        <div className="absolute w-full left-0 bg-green-100 text-green-700 p-3 rounded-md text-sm text-center">
          Registration was successful!
        </div>
      )}
    </div>
  );
}
