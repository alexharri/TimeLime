import { timelineActions } from "~/core/state/timeline/timelineActions";
import { timelineSelectionActions } from "~/core/state/timelineSelection/timelineSelectionActions";
import { ActionsReturnType } from "~/types/commonTypes";

export type TimelineAction = ActionsReturnType<typeof timelineActions>;
export type TimelineSelectionAction = ActionsReturnType<typeof timelineSelectionActions>;
