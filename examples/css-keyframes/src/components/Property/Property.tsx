import React from "react";
import { useSetTimelineValueAtFrameIndex, useTimeline } from "timelime/react";
import { NumberInput } from "~examples/css-keyframes/components/NumberInput/NumberInput";
import s from "~examples/css-keyframes/components/Property/Property.styles";
import { propertyInfoMap } from "~examples/css-keyframes/cssKeyframeConstants";

interface Props {
  timelineId: string;
}

export const Property: React.FC<Props> = (props) => {
  const { timelineId } = props;

  const { timeline, selection, value, setIsVisible } = useTimeline({ timelineId });
  const { onValueChange, onValueChangeEnd } = useSetTimelineValueAtFrameIndex({ timelineId });

  const active = !!selection;
  const propertyInfo = propertyInfoMap[timeline.id];

  return (
    <div className={s("container", { active })}>
      <div className={s("label")}>
        <span onClick={() => setIsVisible(!active)}>{propertyInfo.label}:</span>{" "}
        <NumberInput
          value={value}
          onValueChange={onValueChange}
          onValueChangeEnd={onValueChangeEnd}
        />
        <button>Prev</button>
        <button>Next</button>
      </div>
    </div>
  );
};
