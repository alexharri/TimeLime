import React from "react";
import { Property } from "~/css-keyframes/src/Property";
import s from "~/css-keyframes/src/PropertyList.styles";
import { useTimelineIds } from "~/react/useTimelineIds";

export const PropertyList: React.FC = () => {
  const timelineIds = useTimelineIds();

  return (
    <div className={s("container")}>
      {timelineIds.map((id) => (
        <Property key={id} timelineId={id} />
      ))}
    </div>
  );
};
