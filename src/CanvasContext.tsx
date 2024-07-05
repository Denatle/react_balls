import { PropsWithChildren, useEffect } from "react";
import Ball from "./classes/Ball";

import React, { useContext, useRef, useState } from "react";
import Vector2 from "./classes/Vector2";
import { assert } from "console";

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
    if (!contextRef.current) {
      return;
    }
    const { offsetX, offsetY } = nativeEvent;
    if (button == 0) {
      ballsRef.current.push(
        new Ball(
          new Vector2(offsetX, offsetY),
          // Math.round(Math.random() * 100),
          50,
          // new Vector2(Math.random() - 0.5, Math.random() - 0.5)
          new Vector2(-0.2, -0.2)
        )
      );
    }
    else if (button == 1) {
      ballsRef.current.push(
        new Ball(
          new Vector2(offsetX, offsetY),
          // Math.round(Math.random() * 100),
          50,
          // new Vector2(Math.random() - 0.5, Math.random() - 0.5)
          new Vector2(0, 0)
        )
      );
    }
  };

  const draw = (time: number) => {
    if (previousTimeRef.current != undefined) {
      const deltaTime = time - previousTimeRef.current;

      if (!contextRef.current || !canvasRef.current) {
        return;
      }
      clearCanvas();
      for (let ball of ballsRef.current) {
        apply_physics(ball, ballsRef.current, canvasRef.current, deltaTime);

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

const drawCircle = (
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

const apply_physics = (
  ball: Ball,
  balls: Array<Ball>,
  cavnas: HTMLCanvasElement,
  deltaTime: number
) => {
  if (ball.coordinates.y - ball.radius < 0) {
    ball.velocity.y *= -0.5;
    ball.coordinates.y += 2;
  } else if (ball.coordinates.y + ball.radius > cavnas.height) {
    ball.velocity.y *= -0.5;
    ball.coordinates.y -= 2;
  }

  if (ball.coordinates.x - ball.radius < 0) {
    ball.velocity.x *= -0.5;
    ball.coordinates.x += 2;
  } else if (ball.coordinates.x + ball.radius > cavnas.width) {
    ball.velocity.x *= -0.5;
    ball.coordinates.x -= 2;
  }

  for (let other_ball of balls) {
    if (ball === other_ball) {
      continue;
    }
    if (
      ball.coordinates.distance_to(other_ball.coordinates) >
      ball.radius + other_ball.radius
    ) {
      continue;
    }

    const mass1 = 1;
    const mass2 = 1;
    const damp = 1;

    let direction = other_ball.coordinates
      .substract(ball.coordinates)
      .normalize();

    let previous_velocity = new Vector2(ball.velocity.x, ball.velocity.y);
    ball.velocity = other_ball.velocity
      .multiply_n(2 * mass2 - damp)
      .add(ball.velocity.multiply_n(mass1 - mass2));
    other_ball.velocity = previous_velocity
      .multiply_n(2 * mass1 - damp)
      .add(other_ball.velocity.multiply_n(mass2 - mass1));

    ball.coordinates = ball.coordinates.substract(
      direction.multiply_n(
        ball.radius -
          ball.coordinates.distance_to(other_ball.coordinates) +
          other_ball.radius +
          1
      )
    );
    other_ball.coordinates = other_ball.coordinates.substract(
      direction.multiply_n(
        other_ball.radius -
          other_ball.coordinates.distance_to(ball.coordinates) +
          ball.radius +
          1
      )
    );
  }
  ball.coordinates = ball.coordinates.add(ball.velocity.multiply_n(deltaTime));
};
