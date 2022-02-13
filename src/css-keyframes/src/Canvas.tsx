import React, { useContext } from "react";
import { TimelineStateContext } from "~/react/TimelineStateContext";
import s from "./Canvas.styles";

export const Canvas: React.FC = () => {
  const { GraphEditor } = useContext(TimelineStateContext)!;

  return (
    <div className={s("canvas")}>
      <GraphEditor behavior="absolute" />
    </div>
  );
};
