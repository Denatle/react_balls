import { useEffect, useRef } from "react";

import { useCanvas } from "../CanvasContext";

function Canvas() {
  const {
    canvasRef,
    prepareCanvas,
    mouseDown,
    mouseUp,
    updateMouse,
    contextMenu,
  } = useCanvas();

  useEffect(() => {
    prepareCanvas();
  }, []);

  return (
    <canvas
      height={800}
      width={1600}
      onMouseDown={mouseDown}
      onMouseUp={mouseUp}
      onMouseMove={updateMouse}
      ref={canvasRef}
      onContextMenu={contextMenu}
    />
  );
}
export default Canvas;
