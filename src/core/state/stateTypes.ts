import { TimelineState } from "~/core/state/timeline/timelineReducer";
import { TimelineSelectionState } from "~/core/timelineSelectionReducer";
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
  yPan?: number;
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
}

export interface PerformActionOptions {
  primary: PrimaryState;
  selection: SelectionState;
  view: ViewState;

  onPrimaryStateChange: (primaryState: PrimaryState) => void;
  onSelectionStateChange: (selectionState: SelectionState) => void;
  onViewStateChange: (viewState: ViewState) => void;
  onEphemeralStateChange?: (ephemeralState: EphemeralState) => void;

  render: (renderState: RenderState) => void;

  onCancel: () => void;
  onSubmit: (options: SubmitActionOptions) => void;
}
