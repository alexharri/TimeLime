import React from "react";
import {
  createKeyframeAtFrameIndex,
  moveFrameIndexToNextKeyframe,
  selectKeyframeAtFrameIndex,
} from "timelime/core";
import { useSetTimelineValueAtFrameIndex, useTimeline, useTimelineState } from "timelime/react";
import { EyeIcon } from "~examples/css-keyframes/components/icon/EyeIcon";
import { KeyframeIcon } from "~examples/css-keyframes/components/icon/KeyframeIcon";
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

  const { timeline, selection, value, setIsVisible, currKeyframe, prevKeyframe, nextKeyframe } =
    useTimeline({ timelineId });
  const { onValueChange, onValueChangeEnd } = useSetTimelineValueAtFrameIndex({ timelineId });

  const visible = !!selection;
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

  const currentKeyframeSelected = currKeyframe
    ? selection?.keyframes[currKeyframe.id] || false
    : false;

  const onClickKeyframeButton = () => {
    getActionOptions((actionOptions) => {
      if (currKeyframe) {
        selectKeyframeAtFrameIndex(actionOptions, { timelineId });
        return;
      }
      createKeyframeAtFrameIndex(actionOptions, { timelineId });
    });
  };

  return (
    <div className={s("container", { active: visible })}>
      <button className={s("visibility")} onClick={() => setIsVisible(!visible)}>
        <EyeIcon open={visible} />
      </button>
      <div className={s("label")}>{propertyInfo.label}:</div>
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
        className={s("keyframeButton", {
          active: !!currKeyframe,
          selected: currentKeyframeSelected,
        })}
        onClick={onClickKeyframeButton}
      >
        <KeyframeIcon />
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
