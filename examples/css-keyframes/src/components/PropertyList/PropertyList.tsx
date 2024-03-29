import React from "react";
import { useTimelineIds } from "timelime/react";
import { Property } from "~examples/css-keyframes/components/Property/Property";
import s from "~examples/css-keyframes/components/PropertyList/PropertyList.styles";

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
