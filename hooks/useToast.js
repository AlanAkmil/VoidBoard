import { useCallback, useRef, useState } from "react";

let seq = 0;

export function useToast() {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const toast = useCallback((msg, type = "info") => {
    const id = ++seq;
    setToasts((t) => [...t, { id, msg, type }]);
    timers.current[id] = setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
      delete timers.current[id];
    }, 3500);
  }, []);

  return { toasts, toast };
}
