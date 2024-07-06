import { PropsWithChildren, useEffect } from "react";
import Ball from "./classes/Ball";

import React, { useContext, useRef, useState } from "react";
import Vector2 from "./classes/Vector2";
import BallMenu from "./components/BallMenu";

const CanvasContext = React.createContext<any>(null);

export const CanvasProvider = ({ children }: PropsWithChildren) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const ballsRef = useRef<Array<Ball>>([]);

  const requestRef = useRef<number>(0);
  const previousTimeRef = useRef<number>();

  const mousePosRef = useRef<Vector2>(new Vector2(0, 0));
  const isBumpingRef = useRef<boolean>(false);

  const [contextMenuValue, setContextMenu] = useState<JSX.Element>();

  const prepareCanvas = () => {
    if (!canvasRef.current) {
      return;
    }
    let canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }
    contextRef.current = context;
  };

  const mouseDown = ({ nativeEvent }: React.MouseEvent<HTMLCanvasElement>) => {
    setContextMenu(<></>)
    nativeEvent.preventDefault();
    const button = nativeEvent.button;
    if (!contextRef.current) {
      return;
    }
    const { offsetX, offsetY } = nativeEvent;
    if (button == 0) {
      isBumpingRef.current = true;
    } else if (button == 1) {
      ballsRef.current.push(
        new Ball(
          new Vector2(offsetX, offsetY),
          Math.round(Math.random() * 50 + 20),
          new Vector2(Math.random() - 0.5, Math.random() - 0.5)
        )
      );
    }
  };

  const mouseUp = ({ nativeEvent }: React.MouseEvent<HTMLCanvasElement>) => {
    if (nativeEvent.button != 0) {
      return;
    }
    isBumpingRef.current = false;
  };

  const update = (time: number) => {
    if (previousTimeRef.current != undefined) {
      const deltaTime = time - previousTimeRef.current;
      clearCanvas();
      for (let ball of ballsRef.current) {
        if (!contextRef.current || !canvasRef.current) {
          return;
        }

        apply_physics(
          ball,
          ballsRef.current,
          canvasRef.current,
          deltaTime,
          isBumpingRef.current,
          mousePosRef.current
        );

        drawCircle(contextRef.current, {
          radius: ball.radius,
          lineWidth: 3,
          strokeStyle: ball.color,
          colorFill: ball.color,
          startY: ball.coordinates.y,
          startX: ball.coordinates.x,
        });
      }

      ballsRef.current.map((ball) => (ball.changed_velocity = false));
    }
    previousTimeRef.current = time;
    requestRef.current = requestAnimationFrame(update);
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

  const updateMouse = ({
    nativeEvent,
  }: React.MouseEvent<HTMLCanvasElement>) => {
    mousePosRef.current.x = nativeEvent.offsetX;
    mousePosRef.current.y = nativeEvent.offsetY;
  };

  const contextMenu = ({
    nativeEvent,
  }: React.MouseEvent<HTMLCanvasElement>) => {
    nativeEvent.preventDefault();
    for (let ball of ballsRef.current) {
      if (ball.coordinates.distance_to(mousePosRef.current) > ball.radius) {
        continue
      }
      setContextMenu(<BallMenu ball={ball} position={mousePosRef.current} on_change={() => {setContextMenu(<></>)}}></BallMenu>);
    }
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(update);
    return () => cancelAnimationFrame(requestRef.current);
  }, []);

  return (
    <>
      <CanvasContext.Provider
        value={{
          canvasRef,
          contextRef,
          prepareCanvas,
          mouseDown,
          mouseUp,
          updateMouse,
          contextMenu,
        }}
      >
        {children}
      </CanvasContext.Provider>
      {contextMenuValue}
    </>
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
  }
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
  deltaTime: number,
  isBumping: boolean,
  mousePos: Vector2
) => {
  const bumpStrength = 0.1;
  if (isBumping && ball.coordinates.distance_to(mousePos) < ball.radius) {
    console.log("bump");
    let direction = mousePos.substract(ball.coordinates).normalize();
    ball.velocity = ball.velocity.add(direction.multiply_n(-bumpStrength));
  }

  for (let other_ball of balls) {
    if (ball.changed_velocity) {
      break;
    }
    if (ball === other_ball || other_ball.changed_velocity) {
      continue;
    }
    if (
      ball.coordinates.distance_to(other_ball.coordinates) >
      ball.radius + other_ball.radius
    ) {
      continue;
    }
    ball.changed_velocity = true;
    other_ball.changed_velocity = true;

    let mass1 = ball.radius / 50;
    let mass2 = other_ball.radius / 50;
    let damp = mass1 + mass2;

    let direction = other_ball.coordinates
      .substract(ball.coordinates)
      .normalize();

    let previous_velocity = new Vector2(ball.velocity.x, ball.velocity.y);

    ball.velocity = calculate_velocity(
      ball.velocity,
      other_ball.velocity,
      ball.coordinates,
      other_ball.coordinates,
      mass1,
      mass2,
      damp
    );
    other_ball.velocity = calculate_velocity(
      other_ball.velocity,
      previous_velocity,
      other_ball.coordinates,
      ball.coordinates,
      mass2,
      mass1,
      damp
    );
    ball.coordinates = ball.coordinates.substract(
      direction.multiply_n(
        ball.radius -
          ball.coordinates.distance_to(other_ball.coordinates) +
          other_ball.radius
      )
    );
  }
  if (ball.coordinates.y - ball.radius < 0) {
    ball.velocity.y *= -0.5;
    ball.coordinates.y += 1;
  } else if (ball.coordinates.y + ball.radius > cavnas.height) {
    ball.velocity.y *= -0.5;
    ball.coordinates.y -= 1;
  }

  if (ball.coordinates.x - ball.radius < 0) {
    ball.velocity.x *= -0.5;
    ball.coordinates.x += 1;
  } else if (ball.coordinates.x + ball.radius > cavnas.width) {
    ball.velocity.x *= -0.5;
    ball.coordinates.x -= 1;
  }
  ball.coordinates = ball.coordinates.add(ball.velocity.multiply_n(deltaTime));
};

const calculate_velocity = (
  v1: Vector2,
  v2: Vector2,
  x1: Vector2,
  x2: Vector2,
  m1: number,
  m2: number,
  damp: number
): Vector2 => {
  let second = (2 * m2) / (m1 + m2);
  let third =
    v1.substract(v2).dot(x1.substract(x2)) / x1.substract(x2).length() ** 2;
  let fourth = x1.substract(x2);
  return v1
    .substract(fourth.multiply_n(second).multiply_n(third))
    .divide_n(damp);
};
