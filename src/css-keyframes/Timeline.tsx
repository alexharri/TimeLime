import React from "react";
import { TimelineSelectionState } from "~/core/state/timelineSelection/timelineSelectionReducer";
import { Canvas } from "~/css-keyframes/Canvas";
import { Properties } from "~/css-keyframes/PropertyList";
import s from "~/css-keyframes/Timeline.styles";
import { TimelineMap } from "~/types/timelineTypes";

interface Props {
  timelines: TimelineMap;
  timelineSelectionMap: TimelineSelectionState;
  canvasRef: React.Ref<HTMLCanvasElement>;
  length: number;
  setLength: (length: number) => void;
}

export const Timeline: React.FC<Props> = (props) => {
  const { timelines, timelineSelectionMap, canvasRef } = props;

  return (
    <div className={s("container")}>
      <Properties timelines={timelines} timelineSelectionMap={timelineSelectionMap} />
      <Canvas ref={canvasRef} />
    </div>
  );
};
