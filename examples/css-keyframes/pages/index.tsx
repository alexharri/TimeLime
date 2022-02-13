import React, { useEffect, useState } from "react";
import { CSSKeyframes } from "~examples/css-keyframes/CSSKeyframe";

export default function Page() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <>
      <CSSKeyframes />
    </>
  );
}
