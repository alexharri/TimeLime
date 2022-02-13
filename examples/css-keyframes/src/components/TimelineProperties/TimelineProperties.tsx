import React from "react";
import { useTimelineLength } from "timelime/react";
import { NumberInput } from "~examples/css-keyframes/components/NumberInput/NumberInput";
import s from "~examples/css-keyframes/components/TimelineProperties/TimelineProperties.styles";

export const TimelineProperties: React.FC = () => {
  const [length, setLength] = useTimelineLength();

  return (
    <div className={s("container")}>
      <div className={s("label")}>Timeline length</div>
      <NumberInput value={length} onValueChange={setLength} decimalPlaces={0} />
    </div>
  );
};
