import React, { useContext } from "react";
import { TimelineStateContext } from "~/react/TimelineStateContext";
import styles from "./Canvas.styles";

export const Canvas: React.FC = () => {
  const C = useContext(TimelineStateContext)!.Canvas;

  return (
    <div className={styles.canvas}>
      <C />
    </div>
  );
};
