import React from "react";
import { Canvas } from "~/css-keyframes/Canvas";
import { NumberInput } from "~/css-keyframes/NumberInput/NumberInput";
import { PropertyList } from "~/css-keyframes/PropertyList";
import s from "~/css-keyframes/Timeline.styles";
import { useTimelineLength } from "~/react/useTimelineLength";

interface Props {
  canvasRef: React.Ref<HTMLCanvasElement>;
}

export const Timeline: React.FC<Props> = (props) => {
  const { canvasRef } = props;

  const [length, setLength] = useTimelineLength();

  return (
    <div className={s("container")}>
      <PropertyList />
      <NumberInput value={length} setValue={setLength} decimalPlaces={0} />
      <Canvas ref={canvasRef} />
    </div>
  );
};
