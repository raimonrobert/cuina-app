"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/store/useStore";

export default function Toast() {
  const toast = useStore((s) => s.toast);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!toast.seq) return;
    setVisible(true);
    const t = setTimeout(() => setVisible(false), 2500);
    return () => clearTimeout(t);
  }, [toast.seq]);

  return (
    <div className={`toast ${visible ? "on" : ""} ${toast.type}`}>{toast.msg}</div>
  );
}
