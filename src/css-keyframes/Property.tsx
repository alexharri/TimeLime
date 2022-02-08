import React, { useMemo } from "react";
import { TimelineSelection } from "~/core/state/timelineSelection/timelineSelectionReducer";
import { getTimelineValueAtIndex } from "~/core/timeline/timelineValueAtIndex";
import { propertyInfoMap } from "~/css-keyframes/cssKeyframeConstants";
import s from "~/css-keyframes/Property.styles";
import { Timeline } from "~/types/timelineTypes";

interface Props {
  timeline: Timeline;
  frameIndex: number;
  selection?: TimelineSelection;
}

export const Property: React.FC<Props> = (props) => {
  const { timeline, frameIndex, selection } = props;

  const active = !!selection;

  const propertyInfo = propertyInfoMap[timeline.id];

  const value = useMemo(() => {
    return getTimelineValueAtIndex({ frameIndex, timeline });
  }, [frameIndex, timeline]);

  return (
    <div className={s("container", { active })}>
      <div className={s("label")}>
        {propertyInfo.label}: {value}
      </div>
    </div>
  );
};
