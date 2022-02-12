import React from "react";
import s from "~/css-keyframes/Preview/Preview.styles";
import { useTimelineIds } from "~/react/useTimelineIds";
import { useTimelineValues } from "~/react/useTimelineValues";

export const Preview: React.FC = () => {
  const timelineIds = useTimelineIds() as ["translateX", "translateY"];

  const { translateX, translateY } = useTimelineValues(timelineIds);

  console.log({ translateX, translateY });

  return (
    <div className={s("container")}>
      <div className={s("box")} />
    </div>
  );
};
