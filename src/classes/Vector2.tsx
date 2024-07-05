class Vector2 {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  add(other: Vector2): Vector2 {
    return new Vector2(this.x + other.x, this.y + other.y);
  }

  substract(other: Vector2): Vector2 {
    return new Vector2(this.x - other.x, this.y - other.y);
  }

  multiply(other: Vector2): Vector2 {
    return new Vector2(this.x * other.x, this.y * other.y);
  }

  divide(other: Vector2): Vector2 {
    return new Vector2(this.x / other.x, this.y / other.y);
  }

  add_n(num: number): Vector2 {
    return new Vector2(this.x + num, this.y + num);
  }

  substract_n(num: number): Vector2 {
    return new Vector2(this.x - num, this.y - num);
  }

  multiply_n(num: number): Vector2 {
    return new Vector2(this.x * num, this.y * num);
  }

  divide_n(num: number): Vector2 {
    return new Vector2(this.x / num, this.y / num);
  }

  distance_to(other: Vector2): number {
    return Math.sqrt((this.x - other.x) ** 2 + (this.y - other.y) ** 2);
  }

  length(): number {
    return Math.sqrt(this.x ** 2 + this.y ** 2);
  }

  normalize(): Vector2 {
    let length = this.length();
    return new Vector2(this.x / length, this.y / length);
  }

  dot(other: Vector2): number {
    return this.x * other.x + this.y * other.y;
  }
}

export default Vector2;
