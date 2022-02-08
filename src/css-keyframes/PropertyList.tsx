import React from "react";
import { TimelineSelectionState } from "~/core/state/timelineSelection/timelineSelectionReducer";
import { propertyIdList } from "~/css-keyframes/cssKeyframeConstants";
import { Property } from "~/css-keyframes/Property";
import { TimelineMap } from "~/types/timelineTypes";
import s from "~/css-keyframes/PropertyList.styles";

interface Props {
  timelines: TimelineMap;
  timelineSelectionMap: TimelineSelectionState;
  frameIndex: number;
}

export const Properties: React.FC<Props> = (props) => {
  const { timelines, timelineSelectionMap, frameIndex } = props;

  const propertyTimelines = propertyIdList
    .map((propertyId) => timelines[propertyId])
    .filter(Boolean);

  return (
    <div className={s("container")}>
      {propertyTimelines.map((timeline) => (
        <Property
          key={timeline.id}
          timeline={timeline}
          selection={timelineSelectionMap[timeline.id]}
          frameIndex={frameIndex}
        />
      ))}
    </div>
  );
};
