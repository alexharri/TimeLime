import { animate, AnimateOptions } from "~/core/utils/animate";

export const createNumberTransition = (
  initialValue: number,
  options: AnimateOptions = {}
) => {
  const result = { value: initialValue, setValue };

  let activeAnimation: ReturnType<typeof animate> | null = null;

  function setValue(newValue: number) {
    if (activeAnimation) {
      activeAnimation.cancel();
    }

    const promise = animate(
      { ...options, from: result.value, to: newValue },
      (v) => {
        result.value = v;
      }
    );
    promise.then((cancelled) => {
      if (!cancelled) {
        activeAnimation = null;
      }
    });

    activeAnimation = promise;
  }

  return result;
};
