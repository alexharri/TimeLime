import React from "react";
import { useTimelineIds, useTimelineValues } from "timelime/react";
import s from "~examples/css-keyframes/Preview/Preview.styles";

export const Preview: React.FC = () => {
  const timelineIds = useTimelineIds() as Array<"translateX" | "translateY">;

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
