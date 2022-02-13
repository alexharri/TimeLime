export const elementHasKeyboardFocus = () => {
  if (!document.activeElement) {
    return false;
  }

  return (
    document.activeElement.tagName === "INPUT" ||
    document.activeElement.tagName === "TEXTAREA"
  );
};
