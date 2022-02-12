import React from "react";
import { Canvas } from "~/css-keyframes/Canvas";
import { PropertyList } from "~/css-keyframes/PropertyList";
import s from "~/css-keyframes/Timeline.styles";

interface Props {
  canvasRef: React.Ref<HTMLCanvasElement>;
}

export const Timeline: React.FC<Props> = (props) => {
  const { canvasRef } = props;

  return (
    <div className={s("container")}>
      <PropertyList />
      <Canvas ref={canvasRef} />
    </div>
  );
};
