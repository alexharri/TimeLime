import React, { useContext, useEffect } from "react";
import { attachHandlers } from "~/core/handlers/attachHandlers";
import { CSSKeyframesStateContext } from "~/css-keyframes/state";
import styles from "./Canvas.styles";

export const Canvas = () => {
  const { canvasRef, getState, requestAction } = useContext(CSSKeyframesStateContext);

  useEffect(() => {
    const canvas = canvasRef.current!;

    const { detach } = attachHandlers({ el: canvas, requestAction, getState });
    return detach;
  }, []);

  return <canvas ref={canvasRef} className={styles.canvas} />;
};
