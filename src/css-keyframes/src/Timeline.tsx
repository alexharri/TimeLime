import React from "react";
import { Canvas } from "~/css-keyframes/src/Canvas";
import { PropertyList } from "~/css-keyframes/src/PropertyList";
import s from "~/css-keyframes/src/Timeline.styles";
import { TimelineProperties } from "~/css-keyframes/src/TimelineProperties";

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
