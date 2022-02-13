import React, { useRef, useState } from "react";
import { addListener, removeListener } from "~/core/listener/addListener";
import { isKeyCodeOf } from "~/core/listener/keyboard";
import { useMouseDownOutside } from "~/core/utils/hook/useMouseDownOutside";
import { getDistance } from "~/core/utils/math/math";
import { Vec2 } from "~/core/utils/math/Vec2";
import styles from "~/css-keyframes/NumberInput/NumberInput.styles";

interface Props {
  tick?: number;
  pxPerTick?: number;
  value: number;
  setValue: (value: number) => void;
  onValueChangeEnd?: () => void;
  shiftSnap?: number;
  min?: number;
  max?: number;
  decimalPlaces?: number;
}

export const NumberInput: React.FC<Props> = (props) => {
  const { decimalPlaces, tick = 1 } = props;

  const inputRef = useRef<HTMLInputElement>(null);

  const [typing, setTyping] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const onEnter = () => {
    const value = Number(parseFloat(inputValue).toFixed(decimalPlaces));
    setInputValue("");

    const isValidValue = Number.isFinite(value);
    const hasChanged = parseFloat(inputValue) !== props.value;

    if (!isValidValue || !hasChanged) {
      setTyping(false);
      return;
    }

    props.setValue(value);
    props.onValueChangeEnd?.();
    setTyping(false);
  };

  const onMouseDown = (e: React.MouseEvent) => {
    const initialPosition = Vec2.fromEvent(e);
    const initialValue = props.value;

    let moveVector = Vec2.ORIGIN;
    let hasMoved = false;

    const moveToken = addListener.repeated("mousemove", (e) => {
      const position = Vec2.fromEvent(e);

      if (!hasMoved) {
        if (getDistance(position, initialPosition) < 5) {
          return;
        }
        hasMoved = true;
      }

      moveVector = position.sub(initialPosition);
      const nextValue = initialValue + moveVector.x * tick;

      props.setValue(nextValue);
    });

    addListener.once("mouseup", () => {
      removeListener(moveToken);

      if (!hasMoved) {
        setTyping(true);
        setInputValue(props.value.toString());
        requestAnimationFrame(() => {
          inputRef.current?.select();
        });
      } else {
        props.onValueChangeEnd?.();
      }
    });
  };

  useMouseDownOutside(inputRef, onEnter);

  if (typing) {
    return (
      <div className={styles.container}>
        <input
          className={styles.input}
          ref={inputRef}
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.currentTarget.value);
            e.stopPropagation();
          }}
          onKeyDown={(e) => {
            if (isKeyCodeOf("Enter", e.keyCode)) {
              onEnter();
            }
          }}
        />
      </div>
    );
  }

  const val = props.value.toFixed(typeof decimalPlaces === "number" ? decimalPlaces : 1);

  return (
    <div className={styles.container}>
      <button className={styles.button} onMouseDown={onMouseDown} tabIndex={-1}>
        <div className={styles.button__value}>{val}</div>
      </button>
    </div>
  );
};
