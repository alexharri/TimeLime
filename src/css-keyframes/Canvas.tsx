import React from "react";
import styles from "./Canvas.styles";

export const Canvas = React.forwardRef<HTMLCanvasElement, {}>((_props, ref) => {
  return <canvas ref={ref} className={styles.canvas} />;
});
