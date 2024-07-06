import "./BallMenu.css";
import Vector2 from "../classes/Vector2";
import React from "react";
import Ball from "../classes/Ball";

export interface BallMenuProps {
  position: Vector2;
  ball: Ball;
  on_change: () => void;
}

const BallMenu = ({ position, ball, on_change }: BallMenuProps) => {
  const [color, setColor] = React.useState<string>(ball.color);
  return (
    <div className="BallMenu" style={{ top: position.y, left: position.x }}>
      <p>Ball color:</p>
      <input
        type="color"
        value={color}
        onChange={(e) => {
            ball.color = e.target.value
            setColor(e.target.value);
            on_change();
        }}
      ></input>
    </div>
  );
};

export default BallMenu;
