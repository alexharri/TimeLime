import React from "react";
import { useTimelineState } from "timelime/react";
import s from "~examples/css-keyframes/components/Canvas/Canvas.styles";

export const Canvas: React.FC = () => {
  const { GraphEditor } = useTimelineState();

  return (
    <div className={s("canvas")}>
      <GraphEditor behavior="absolute" />
    </div>
  );
};
