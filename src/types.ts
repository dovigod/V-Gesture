


//NOTE) coordinates refers center of element, not top left of element.
//x, y
export type Vector2D = [number, number];
//x, y, z
export type Vector3D = [number, number, number];
//x, y, dx ,dy
export type Boundary2D = [number, number, number, number]
//x, y, z, dx, dy, dz
export type Boundary3D = [number, number, number, number, number, number];
// export type Point<Dimension, T extends Number[] = []> = Dimension extends T['length'] ? T : Point<Dimension, [...T, Number]>

export type Point = (Vector2D | Vector3D);
export type Boundary = (Boundary2D | Boundary3D)
