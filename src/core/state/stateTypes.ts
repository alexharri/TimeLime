import { TimelineState } from "~/core/state/timeline/timelineReducer";
import { TimelineSelectionState } from "~/core/state/timelineSelection/timelineSelectionReducer";
import { Vec2 } from "~/core/utils/math/Vec2";
import { Rect, ViewBounds, YBounds } from "~/types/commonTypes";

export type PrimaryState = TimelineState;

export type SelectionState = TimelineSelectionState;

export interface ViewState {
  viewBounds: ViewBounds;
  viewport: Rect;
  length: number;
}

export interface EphemeralState {
  yBounds?: YBounds;
  pan?: Vec2;
  keyframeShift?: Vec2;
}

export interface TrackedState {
  primary: PrimaryState;
  selection: SelectionState;
  view: ViewState;
}

export interface RenderState {
  primary: PrimaryState;
  selection: SelectionState;
  view: ViewState;
  ephemeral: EphemeralState;
}

interface SubmitActionOptions {
  name: string;
  allowSelectionShift: boolean;
  state: TrackedState;
}

export interface ActionOptions {
  initialState: TrackedState;

  onStateChange?: {
    primary?: (primaryState: PrimaryState) => void;
    selection?: (selectionState: SelectionState) => void;
    view?: (viewState: ViewState) => void;
    ephemeral?: (ephemeralState: EphemeralState) => void;
  };

  render: (renderState: RenderState) => void;

  onCancel: () => void;
  onSubmit: (options: SubmitActionOptions) => void;
}
