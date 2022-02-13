import React from "react";
import { Canvas } from "~examples/css-keyframes/Canvas";
import { PropertyList } from "~examples/css-keyframes/PropertyList";
import s from "~examples/css-keyframes/Timeline.styles";
import { TimelineProperties } from "~examples/css-keyframes/TimelineProperties";

export const Timeline: React.FC = () => {
  return (
    <div className={s("container")}>
      <PropertyList />
      <div className={s("right")}>
        <TimelineProperties />
        <Canvas />
      </div>
    </div>
  );
};
