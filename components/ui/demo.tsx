import React from "react";
import TextThree from "./text-three";

const DemoOne = () => {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Outfit', sans-serif",
        fontWeight: 900,
        fontSize: "clamp(5rem, 15vw, 12rem)",
        color: "var(--color-primary)",
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        userSelect: "none"
      }}
    >
      <TextThree text="MY JOURNEY" />
    </div>
  );
};

export { DemoOne };
