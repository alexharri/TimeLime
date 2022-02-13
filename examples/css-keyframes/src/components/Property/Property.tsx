import React from "react";
import { moveFrameIndexToNextKeyframe } from "timelime/core";
import { useSetTimelineValueAtFrameIndex, useTimeline, useTimelineState } from "timelime/react";
import { NextKeyframeIcon } from "~examples/css-keyframes/components/icon/NextKeyframeIcon";
import { PreviousKeyframeIcon } from "~examples/css-keyframes/components/icon/PreviousKeyframeIcon";
import { NumberInput } from "~examples/css-keyframes/components/NumberInput/NumberInput";
import s from "~examples/css-keyframes/components/Property/Property.styles";
import { propertyInfoMap } from "~examples/css-keyframes/cssKeyframeConstants";

interface Props {
  timelineId: string;
}

export const Property: React.FC<Props> = (props) => {
  const { timelineId } = props;

  const { timeline, selection, value, setIsVisible, prevKeyframe, nextKeyframe } = useTimeline({
    timelineId,
  });
  const { onValueChange, onValueChangeEnd } = useSetTimelineValueAtFrameIndex({ timelineId });

  const active = !!selection;
  const propertyInfo = propertyInfoMap[timeline.id];

  const { getActionOptions } = useTimelineState();

  const onMoveToPreviousKeyframe = () => {
    getActionOptions((actionOptions) => {
      moveFrameIndexToNextKeyframe(actionOptions, { timelineId, direction: "backward" });
    });
  };

  const onMoveToNextKeyframe = () => {
    getActionOptions((actionOptions) => {
      moveFrameIndexToNextKeyframe(actionOptions, { timelineId, direction: "forward" });
    });
  };

  return (
    <div className={s("container", { active })}>
      <div className={s("label")}>
        <span onClick={() => setIsVisible(!active)}>{propertyInfo.label}:</span>{" "}
      </div>
      <NumberInput
        value={value}
        onValueChange={onValueChange}
        onValueChangeEnd={onValueChangeEnd}
      />
      <button
        className={s("arrowButton", { active: !!prevKeyframe })}
        onClick={onMoveToPreviousKeyframe}
      >
        <PreviousKeyframeIcon />
      </button>
      <button
        className={s("arrowButton", { active: !!nextKeyframe })}
        onClick={onMoveToNextKeyframe}
      >
        <NextKeyframeIcon />
      </button>
    </div>
  );
};
