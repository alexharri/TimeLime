import { useState } from "react";
import { Rect } from "timelime/types";
import { useIsomorphicLayoutEffect } from "~core/utils/hook/useIsomorphicLayoutEffect";

const getRefRect = <T extends HTMLElement>(ref: React.RefObject<T>): Rect => {
  if (!ref.current) {
    throw new Error("Cannot get ref of null 'React.RefObject'");
  }

  const el = ref.current;

  const { top, left, width, height } = el.getBoundingClientRect();
  return { top, left, width, height };
};

export const useRefRect = <T extends HTMLElement>(ref: React.RefObject<T>): Rect | null => {
  const [rect, setRect] = useState(ref.current ? getRefRect(ref) : null);

  useIsomorphicLayoutEffect(() => {
    const onResize = () => {
      setRect(ref.current ? getRefRect(ref) : null);
    };

    let unmounted = false;

    window.addEventListener("resize", onResize);

    if (!rect) {
      setTimeout(() => !unmounted && onResize());
    }

    return () => {
      unmounted = true;
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return rect;
};
