import { css } from "@emotion/css";

export interface StyleParams {
  css: typeof css;
}

type Stylesheet = (callback: { css: typeof css }) => {};

function createGetterFn<R>(result: any) {
  return (name: keyof R, modifiers: Record<string, boolean> = {}): string => {
    let className = result[name] || "";

    const mods = Object.keys(modifiers);
    for (let i = 0; i < mods.length; i += 1) {
      const modifier = mods[i];

      if (modifiers[modifier]) {
        className += ` ${result[name]}--${modifier}`;
      }
    }

    return className;
  };
}

export const createStylesheet = <T extends Stylesheet>(stylesheet: T) => {
  return createGetterFn<ReturnType<T>>(stylesheet({ css }));
};
