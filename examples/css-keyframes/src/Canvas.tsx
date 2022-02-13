import React, { useContext } from "react";
import { TimelineStateContext } from "timelime/react";
import s from "~examples/css-keyframes/Canvas.styles";

export const Canvas: React.FC = () => {
  const { GraphEditor } = useContext(TimelineStateContext)!;

  return (
    <div className={s("canvas")}>
      <GraphEditor behavior="absolute" />
    </div>
  );
};
