import React from "react";
import { Property } from "~/css-keyframes/Property";
import s from "~/css-keyframes/PropertyList.styles";
import { useTimelineIds } from "~/react/useTimelineIds";

export const Properties: React.FC = () => {
  const timelineIds = useTimelineIds();

  return (
    <div className={s("container")}>
      {timelineIds.map((id) => (
        <Property key={id} timelineId={id} />
      ))}
    </div>
  );
};
