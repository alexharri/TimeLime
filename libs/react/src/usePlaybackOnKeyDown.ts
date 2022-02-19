import { useEffect } from "react";
import { addListener, isKeyCodeOf, Key, removeListener, requestAction } from "timelime/core";
import { GetActionOptions } from "timelime/types";

const startPlayback = (options: Options) => {
  if (options.isActionInProgress()) {
    return;
  }

  options.getActionOptions((actionOptions) => {
    requestAction({ userActionOptions: actionOptions }, (params) => {
      let cancelled = false;

      let { frameIndex } = params.view.state;

      params.addListener.keyboardOnce("Space", "keydown", () => {
        cancelled = true;
      });

      params.addListener.once("mousedown", () => {
        cancelled = true;
      });

      const tick = () => {
        if (cancelled || params.done) {
          if (!params.done) {
            params.cancel();
          }
          return;
        }

        ++frameIndex;
        params.view.dispatch((actions) => actions.setFields({ frameIndex }));
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  });
};

interface Options {
  getActionOptions: GetActionOptions;
  isActionInProgress: () => boolean;
}

export const usePlaybackOnKeyDown = (key: Key, options: Options) => {
  useEffect(() => {
    const token = addListener.keydownLong(key, (e) => {
      if (!isKeyCodeOf(key, e.keyCode) || options.isActionInProgress()) {
        return;
      }

      const start = Date.now();
      let didMouseDown = false;

      const mouseDownToken = addListener.repeated("mousedown", () => {
        didMouseDown = true;
      });

      addListener.keyboardOnce(key, "keyup", () => {
        removeListener(mouseDownToken);

        const elapsed = Date.now() - start;

        if (elapsed > 300 || didMouseDown) {
          return;
        }

        startPlayback(options);
      });
    });

    return () => {
      removeListener(token);
    };
  }, [key, options]);
};
