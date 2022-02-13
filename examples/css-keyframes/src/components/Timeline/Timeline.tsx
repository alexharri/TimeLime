import React from "react";
import { Canvas } from "~examples/css-keyframes/components/Canvas/Canvas";
import { PropertyList } from "~examples/css-keyframes/components/PropertyList/PropertyList";
import s from "~examples/css-keyframes/components/Timeline/Timeline.styles";
import { TimelineProperties } from "~examples/css-keyframes/components/TimelineProperties/TimelineProperties";

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
