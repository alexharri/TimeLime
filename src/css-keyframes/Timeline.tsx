import React from "react";
import { Canvas } from "~/css-keyframes/Canvas";
import { PropertyList } from "~/css-keyframes/PropertyList";
import s from "~/css-keyframes/Timeline.styles";
import { TimelineProperties } from "~/css-keyframes/TimelineProperties";

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
