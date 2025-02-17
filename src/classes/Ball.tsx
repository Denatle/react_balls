import Vector2 from "./Vector2";

class Ball {
  coordinates: Vector2;
  radius: number;
  velocity: Vector2;
  changed_velocity: boolean;
  color: string;
  constructor(
    coordinates: Vector2,
    radius: number,
    velocity: Vector2 = new Vector2(0, 0)
  ) {
    this.coordinates = coordinates;
    this.radius = radius;
    this.velocity = velocity;
    this.changed_velocity = false;
    this.color = "#4F7CAC"
  }
}

export default Ball;
