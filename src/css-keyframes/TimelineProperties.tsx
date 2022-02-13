import React from "react";
import { NumberInput } from "~/css-keyframes/NumberInput/NumberInput";
import s from "~/css-keyframes/TimelineProperties.styles";
import { useTimelineLength } from "~/react/useTimelineLength";

export const TimelineProperties: React.FC = () => {
  const [length, setLength] = useTimelineLength();

  return (
    <div className={s("container")}>
      <div className={s("label")}>Timeline length</div>
      <NumberInput value={length} onValueChange={setLength} decimalPlaces={0} />
    </div>
  );
};
