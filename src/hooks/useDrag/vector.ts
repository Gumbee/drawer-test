export type Vector = { x: number; y: number }

export function magnitude(a: Vector): number {
  return Math.sqrt(a.x ** 2 + a.y ** 2)
}

export function distance(a: Vector, b: Vector): number {
  return magnitude(subtract(a, b))
}

export function subtract(a: Vector, b: Vector): Vector {
  return {
    x: a.x - b.x,
    y: a.y - b.y
  }
}

export function add(a: Vector, b: Vector): Vector {
  return {
    x: a.x + b.x,
    y: a.y + b.y
  }
}

export function multiply(a: Vector, f: number): Vector {
  return {
    x: a.x * f,
    y: a.y * f
  }
}
