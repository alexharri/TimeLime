import React from "react";
import { useTimelineIds } from "timelime/react";
import { Property } from "~/Property";
import s from "~/PropertyList.styles";

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
