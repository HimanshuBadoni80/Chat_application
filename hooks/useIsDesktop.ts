"use client";

import { useSyncExternalStore } from "react";

const desktopQuery = "min-width: 768px";
function subscribe(onChange: () => void) {
  const mql = window.matchMedia(desktopQuery);
  mql.addEventListener("change", onChange);
  return () => {
    mql.removeEventListener("change", onChange);
  };
}

function getSnapshot() {
  return window.matchMedia(desktopQuery).matches;
}

function getServerSnapshot() {
  return false;
}

export function useIsDesktop() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
