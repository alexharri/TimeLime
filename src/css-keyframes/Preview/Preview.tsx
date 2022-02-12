import React from "react";
import s from "~/css-keyframes/Preview/Preview.styles";
import { useTimelineIds } from "~/react/useTimelineIds";
import { useTimelineValues } from "~/react/useTimelineValues";

export const Preview: React.FC = () => {
  const timelineIds = useTimelineIds() as ["translateX", "translateY"];

  const { translateX, translateY } = useTimelineValues(timelineIds);

  return (
    <div className={s("container")}>
      <div
        className={s("box")}
        style={{ transform: `translate(${translateX * 3}px, ${-translateY * 3}px)` }}
      />
    </div>
  );
};
