import React from "react";
import { Canvas } from "~/css-keyframes/Canvas";
import { PropertyList } from "~/css-keyframes/PropertyList";
import s from "~/css-keyframes/Timeline.styles";
import { TimelineProperties } from "~/css-keyframes/TimelineProperties";

interface Props {
  canvasRef: React.Ref<HTMLCanvasElement>;
}

export const Timeline: React.FC<Props> = (props) => {
  const { canvasRef } = props;

  return (
    <div className={s("container")}>
      <PropertyList />
      <div className={s("right")}>
        <TimelineProperties />
        <Canvas ref={canvasRef} />
      </div>
    </div>
  );
};
