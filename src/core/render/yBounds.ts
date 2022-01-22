import { keyframesToCurves } from "~/core/transform/keyframesToCurves";
import { splitTimelineCurve } from "~/core/utils/math/splitTimelineCurve";
import { ViewBounds, YBounds } from "~/types/commonTypes";
import { Timeline } from "~/types/timelineTypes";

interface Options {
  viewBounds: ViewBounds;
  length: number;
  timelines: Timeline[];
}

export const getGraphEditorYBounds = (options: Options): YBounds => {
  const { viewBounds, length, timelines } = options;

  const timelineCurves = timelines.map((timeline) =>
    keyframesToCurves(timeline.keyframes)
  );

  const timelineYBounds = timelines.map((timeline, i): [number, number] => {
    if (timeline.keyframes.length === 1) {
      const { value } = timelines[0].keyframes[0];
      return [value, value];
    }

    let paths = timelineCurves[i];
    const originalPaths = [...paths];

    const iStart = viewBounds[0] * (length - 1);
    const iEnd = viewBounds[1] * (length - 1);

    // Remove all paths before and after the viewbounds end
    paths = paths.filter((path) => {
      if (path[path.length - 1].x < iStart || path[0].x > iEnd) {
        return false;
      }
      return true;
    });

    const controlPointYsToConsider: number[] = [];

    // Find control point Ys to consider
    if (paths.length > 0) {
      const curveAtStart = paths[0];
      const curveAtEnd = paths[paths.length - 1];

      if (curveAtStart.length === 4 && curveAtStart[0].x <= iStart) {
        // The first curve is a cubic bezier where `p0` is left of `viewBounds[0]`.
        //
        // If the `p1` or `p2` control points land inside of the view bounds then we want
        // to adjust the yBounds to ALWAYS include them.
        for (let j = 1; j < 3; j += 1) {
          if (curveAtStart[j].x >= iStart && curveAtStart[j].x <= iEnd) {
            controlPointYsToConsider.push(curveAtStart[j].y);
          }
        }
      }

      if (
        paths.length > 1 &&
        curveAtEnd.length === 4 &&
        curveAtEnd[3].x >= iEnd
      ) {
        // Reverse case for start curve.
        for (let j = 1; j < 3; j += 1) {
          if (curveAtEnd[j].x >= iStart && curveAtEnd[j].x <= iEnd) {
            controlPointYsToConsider.push(curveAtEnd[j].y);
          }
        }
      }

      // All points of curves where `0 < i < curves.length - 1` are considered automatically.
    }

    // Split paths that intersect the viewbounds
    if (paths.length > 0) {
      const curveAtStart = paths[0];

      if (curveAtStart[0].x < iStart) {
        // The start of the first curve is not fully within the view bounds.
        //
        // Split the curve where it intersects with the view bounds and include
        // the part of the curve inside of the view bounds.
        const [, newPathAtStart] = splitTimelineCurve(curveAtStart, iStart);
        paths[0] = newPathAtStart;
      }

      const curveAtEnd = paths[paths.length - 1];

      if (curveAtEnd[curveAtEnd.length - 1].x > iEnd) {
        // The end of the last curve is not fully within the view bounds.
        //
        // Split the curve where it intersects with the view bounds and include
        // the part of the curve inside of the view bounds.
        const [newPathAtEnd] = splitTimelineCurve(curveAtEnd, iEnd);
        paths[paths.length - 1] = newPathAtEnd;
      }
    } else {
      const startIndex = originalPaths[0][0].x;
      const lastPath = originalPaths[originalPaths.length - 1];
      const y =
        startIndex > iStart
          ? originalPaths[0][0].y
          : lastPath[lastPath.length - 1].y;
      return [y, y];
    }

    if (paths.length) {
      let yUpper = -Infinity;
      let yLower = Infinity;

      for (let i = 0; i < paths.length; i += 1) {
        for (let j = 0; j < paths[i].length; j += 1) {
          const vec = paths[i][j];
          if (yUpper < vec.y) {
            yUpper = vec.y;
          }
          if (yLower > vec.y) {
            yLower = vec.y;
          }
        }
      }

      for (let i = 0; i < controlPointYsToConsider.length; i += 1) {
        const value = controlPointYsToConsider[i];
        if (yUpper < value) {
          yUpper = value;
        }
        if (yLower > value) {
          yLower = value;
        }
      }

      return [yUpper, yLower];
    } else {
      const value =
        iEnd < timeline.keyframes[0].index
          ? timeline.keyframes[0].value
          : timeline.keyframes[timeline.keyframes.length - 1].value;

      return [value, value];
    }
  });

  const yUpper = Math.max(...timelineYBounds.map(([value]) => value));
  const yLower = Math.min(...timelineYBounds.map(([, value]) => value));

  const diff = yUpper - yLower;

  if (diff === 0) {
    return [yUpper + 10, yUpper - 10];
  }

  // Add .1 of the diff on each side for padding.
  return [yUpper + diff * 0.1, yLower - diff * 0.1];
};
