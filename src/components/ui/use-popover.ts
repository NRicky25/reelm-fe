"use client";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Open/close state for menus. Closes on outside click and Esc.
 * `hover` adds mouse-enter/leave handlers with a short close delay so the
 * pointer can travel from the trigger into the menu.
 */
export function usePopover({ closeDelay = 140 } = {}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hoverOpenedAt = useRef(0);

  const cancel = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  };
  const show = useCallback(() => {
    cancel();
    setOpen(true);
  }, []);
  const hide = useCallback(() => {
    cancel();
    setOpen(false);
  }, []);
  const hideSoon = useCallback(() => {
    cancel();
    timer.current = setTimeout(() => setOpen(false), closeDelay);
  }, [closeDelay]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        (ref.current?.querySelector("button") as HTMLButtonElement | null)?.focus();
      }
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => cancel, []);

  return {
    open,
    ref,
    show,
    hide,
    // a click right after hover-open shouldn't immediately close the menu
    toggle: () => setOpen((o) => (o && Date.now() - hoverOpenedAt.current < 500 ? true : !o)),
    hoverProps: {
      // only real mouse hover; touch uses the click toggle instead
      onPointerEnter: (e: React.PointerEvent) => {
        if (e.pointerType !== "mouse") return;
        if (!open) hoverOpenedAt.current = Date.now();
        show();
      },
      onPointerLeave: (e: React.PointerEvent) => {
        if (e.pointerType === "mouse") hideSoon();
      },
    },
  };
}
