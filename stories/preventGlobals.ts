Object.defineProperty(window, "length", {
  get: function () {
    throw new Error("Attempted to read 'length' from window.");
  },
});

export {};
