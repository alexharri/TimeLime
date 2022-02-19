import { Vec2 } from "timelime/core";
import { Rect, ViewBounds, YBounds } from "~types/commonTypes";
import {
  ControlPointShift,
  NewControlPointShift,
  TimelineSelectionState,
  TimelineState,
} from "~types/timelineTypes";

export type PrimaryState = TimelineState;

export type SelectionState = TimelineSelectionState;

export interface ViewState {
  viewBounds: ViewBounds;
  viewBoundsHeight: number;
  scrubberHeight: number;
  viewport: Rect;
  length: number;
  frameIndex: number;
  allowExceedViewBounds: boolean;
}

export interface EphemeralState {
  yBounds?: YBounds;
  pan?: Vec2;
  keyframeShift?: Vec2;
  controlPointShift?: ControlPointShift;
  newControlPointShift?: NewControlPointShift;
  cursor?: string;
  dragSelectionRect?: Rect;
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

interface SubmitViewActionOptions {
  viewState: ViewState;
}

export interface ActionOptions {
  initialState: TrackedState;

  onStateChange?: {
    primary?: (primaryState: PrimaryState) => void;
    selection?: (selectionState: SelectionState) => void;
    view?: (viewState: ViewState) => void;
    ephemeral?: (ephemeralState: EphemeralState) => void;
    render?: (renderState: RenderState) => void;
  };

  render: (renderState: RenderState) => void;

  onCancel: () => void;
  onSubmit: (options: SubmitActionOptions) => void;
  onSubmitView: (options: SubmitViewActionOptions) => void;
}

export type GetActionOptionsFn = (callback: (actionOptions: ActionOptions) => void) => void;
