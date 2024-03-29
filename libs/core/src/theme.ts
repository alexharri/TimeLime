import { colors } from "~core/colors";

export const theme = {
  timelineColors: [
    colors.red700,
    colors.green500,
    colors.orange500,
    colors.pink500,
    colors.blue500,
  ],
  timelineShadow: colors.dark400,

  background: colors.dark700,
  backgroundOutside: colors.dark500,

  yTickLabel: colors.light700,
  yTickLine: colors.gray500,
  yTickLineShadow: colors.dark500,
  yTickLineOutside: colors.dark800,
  yTickLineOutsideShadow: colors.dark300,

  outsideBorder: colors.dark300,
  insideHighlight: colors.dark800,

  keyframeColor: colors.blue700,
  keyframeFill: colors.dark200,
  keyframeShadow: colors.dark600,

  viewBoundsBackground: colors.dark400,
  viewBoundsBorder: colors.dark200,
  viewBoundsHandleFill: colors.light200,
  viewBoundsHandleBorder: colors.dark200,
  viewBoundsHandleHighlight: colors.light400,
  viewBoundsBarFill: colors.gray300,
  viewBoundsBarHighlight: colors.gray600,

  scrubberBackground: colors.dark300,
  scrubberTickLine: colors.light500,
  scrubberTickTextColor: colors.light500,
  scrubberBorderBottom: colors.dark200,
  scubHead: colors.blue500,

  controlPointColor: colors.yellow900,

  selectionRectFill: `rgba(122, 183, 255, 0.125)`,
  selectionRectBorder: `rgba(122, 183, 255, 0.5)`,
};
