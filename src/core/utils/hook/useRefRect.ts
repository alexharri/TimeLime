import { useState } from "react";
import { useIsomorphicLayoutEffect } from "~/core/utils/hook/useIsomorphicLayoutEffect";
import { Rect } from "~/types/commonTypes";

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
      const el = ref.current;
      console.log(el);
      if (!el) {
        setRect(null);
        return;
      }
      setRect(getRefRect(ref));
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
