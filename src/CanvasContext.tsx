import { PropsWithChildren, useEffect } from "react";
import Ball from "./classes/Ball";

import React, { useContext, useRef, useState } from "react";
import Vector2 from "./classes/Vector2";

const CanvasContext = React.createContext<any>(null);

export const CanvasProvider = ({ children }: PropsWithChildren) => {
  // const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const ballsRef = useRef<Array<Ball>>([]);

  const requestRef = React.useRef<number>(0);
  const previousTimeRef = React.useRef<number>();

  const prepareCanvas = () => {
    if (!canvasRef.current) {
      return;
    }
    let canvas = canvasRef.current;
    // canvas.width = window.innerWidth * 2;
    // canvas.height = window.innerHeight * 2;
    // canvas.style.width = `${window.innerWidth}px`;
    // canvas.style.height = `${window.innerHeight}px`;

    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }
    // context.scale(2, 2);
    contextRef.current = context;
  };

  const click = ({ nativeEvent }: React.MouseEvent<HTMLCanvasElement>) => {
    const button = nativeEvent.button;
    if (button != 0 || !contextRef.current) {
      return;
    }
    const { offsetX, offsetY } = nativeEvent;
    ballsRef.current.push(
      new Ball(
        new Vector2(offsetX, offsetY),
        50,
        // new Vector2(Math.random() - 0.5, Math.random() - 0.5)
        new Vector2(-0.5, -0.5)
      )
    );
  };

  const draw = (time: number) => {
    if (previousTimeRef.current != undefined) {
      const deltaTime = time - previousTimeRef.current;

      if (!contextRef.current || !canvasRef.current) {
        return;
      }
      clearCanvas();
      for (let ball of ballsRef.current) {
        if (ball.coordinates.y - ball.radius < 0) {
          ball.velocity.y *= -1
        }
        else if (ball.coordinates.y + ball.radius > canvasRef.current.height){
          ball.velocity.y *= -1
        }

        if (ball.coordinates.x - ball.radius < 0) {
          ball.velocity.x *= -1
        }
        else if (ball.coordinates.x + ball.radius > canvasRef.current.width){
          ball.velocity.x *= -1
        }
        
        ball.coordinates = ball.coordinates.add(ball.velocity.multiply_n(deltaTime))
        drawCircle(contextRef.current, {
          radius: ball.radius,
          lineWidth: 3,
          strokeStyle: "#4F7CAC",
          colorFill: "#4F7CAC",
          startY: ball.coordinates.y,
          startX: ball.coordinates.x,
        });
      }
    }
    previousTimeRef.current = time;
    requestRef.current = requestAnimationFrame(draw);
  };

  const clearCanvas = () => {
    if (!canvasRef.current) {
      return;
    }
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }
    context.fillStyle = "white";
    context.fillRect(0, 0, canvas.width, canvas.height);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(requestRef.current);
  }, []);

  return (
    <CanvasContext.Provider
      value={{
        canvasRef,
        contextRef,
        prepareCanvas,
        click,
        clearCanvas,
      }}
    >
      {children}
    </CanvasContext.Provider>
  );
};

export const useCanvas = () => useContext(CanvasContext);

export const drawCircle = (
  ctx: CanvasRenderingContext2D,
  circleDims: {
    radius: number;
    lineWidth: number;
    strokeStyle: string;
    colorFill?: string;
    startX: number;
    startY: number;
  },
  rectDims: { w: number; h: number } = { w: 400, h: 3500 }
) => {
  const { radius, strokeStyle, startX, startY, lineWidth, colorFill } =
    circleDims;
  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = strokeStyle;

  ctx?.beginPath();
  ctx?.arc(startX, startY, radius, 0, Math.PI * 2, true);
  ctx?.stroke();
  if (colorFill) {
    ctx.fillStyle = colorFill;
    ctx.fill();
  }
};
