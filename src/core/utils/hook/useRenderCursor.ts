import React, { useCallback, useEffect, useRef } from "react";
import { getKeyFromKeyCode } from "~/core/listener/keyboard";
import { getGraphEditorCursor } from "~/core/render/cursor/graphEditorCursor";
import { RenderState } from "~/core/state/stateTypes";
import { Vec2 } from "~/core/utils/math/Vec2";

interface Options {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  getRenderState: () => RenderState;
}

export const useRenderCursor = (options: Options) => {
  const { canvasRef, getRenderState } = options;

  const lastPosRef = useRef<Vec2 | null>(null);

  const renderCursor = useCallback((renderState: RenderState) => {
    const canvas = canvasRef.current;
    const lastPos = lastPosRef.current;

    if (!lastPos || !canvas) {
      return;
    }

    const cursor = getGraphEditorCursor(lastPos, renderState);
    canvas.style.cursor = cursor;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return () => {};
    }

    const mouseMoveListener = (e: MouseEvent) => {
      lastPosRef.current = Vec2.fromEvent(e);
      renderCursor(getRenderState());
    };

    const keyDownListener = (e: KeyboardEvent) => {
      switch (getKeyFromKeyCode(e.keyCode)) {
        case "Space":
        case "Alt":
        case "Z":
          renderCursor(getRenderState());
          break;
      }
    };

    canvas.addEventListener("mousemove", mouseMoveListener);
    window.addEventListener("keydown", keyDownListener);
    window.addEventListener("keyup", keyDownListener);

    return () => {
      canvas.removeEventListener("mousemove", mouseMoveListener);
      window.removeEventListener("keydown", keyDownListener);
      window.removeEventListener("keyup", keyDownListener);
    };
  }, [canvasRef.current]);

  return { renderCursor };
};
