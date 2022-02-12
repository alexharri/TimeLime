import React, { useContext } from "react";
import { TimelineStateContext } from "~/react/TimelineStateContext";
import s from "./Canvas.styles";

export const Canvas: React.FC = () => {
  const { Canvas: CanvasComponent } = useContext(TimelineStateContext)!;

  return (
    <div className={s("canvas")}>
      <CanvasComponent />
    </div>
  );
};
