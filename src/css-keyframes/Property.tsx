import React from "react";
import { TimelineSelection } from "~/core/state/timelineSelection/timelineSelectionReducer";
import { propertyInfoMap } from "~/css-keyframes/cssKeyframeConstants";
import s from "~/css-keyframes/Property.styles";
import { Timeline } from "~/types/timelineTypes";

interface Props {
  timeline: Timeline;
  selection?: TimelineSelection;
}

export const Property: React.FC<Props> = (props) => {
  const { timeline, selection } = props;

  const active = !!selection;

  const propertyInfo = propertyInfoMap[timeline.id];

  return (
    <div className={s("container", { active })}>
      <div className={s("label")}>{propertyInfo.label}</div>
    </div>
  );
};
