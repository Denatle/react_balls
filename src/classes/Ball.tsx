import Vector2 from "./Vector2";

class Ball {
  coordinates: Vector2;
  radius: number;
  velocity: Vector2;
  constructor(
    coordinates: Vector2,
    radius: number,
    velocity: Vector2 = new Vector2(0, 0)
  ) {
    this.coordinates = coordinates; 
    this.radius = radius;
    this.velocity = velocity;
  }
}

export default Ball;
