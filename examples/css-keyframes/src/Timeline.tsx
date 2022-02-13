import React from "react";
import { Canvas } from "~/Canvas";
import { PropertyList } from "~/PropertyList";
import s from "~/Timeline.styles";
import { TimelineProperties } from "~/TimelineProperties";

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
