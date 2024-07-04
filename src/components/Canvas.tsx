import { useEffect, useRef } from "react";

import { useCanvas } from "../CanvasContext";

function Canvas() {
  const {
    canvasRef,
    prepareCanvas,
    click,
    // draw
  } = useCanvas();

  useEffect(() => {
    prepareCanvas();
  }, []);

  return (
    <canvas
      height={800}
      width={1600}
      onMouseDown={click}
      // onMouseMove={draw}
      ref={canvasRef}
    />
  );
}
export default Canvas;
