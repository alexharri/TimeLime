import React from "react";
import { propertyInfoMap } from "~/css-keyframes/cssKeyframeConstants";
import s from "~/css-keyframes/Property.styles";
import { useTimeline } from "~/react/useTimeline";

interface Props {
  timelineId: string;
}

export const Property: React.FC<Props> = (props) => {
  const { timelineId } = props;

  const { timeline, selection, value } = useTimeline({ timelineId });

  const active = !!selection;
  const propertyInfo = propertyInfoMap[timeline.id];

  return (
    <div className={s("container", { active })}>
      <div className={s("label")}>
        {propertyInfo.label}: {value.toFixed(2)}
      </div>
    </div>
  );
};
