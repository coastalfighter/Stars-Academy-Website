import { ExtrudeGeometry, Shape } from "three";

/** Geometry for the five-point STARS star: five separate points around a pentagon centre. */
export const OUTER = 1.55;
export const INNER = 0.66;
const TWO_PI = Math.PI * 2;
export const STAR_STEP = TWO_PI / 5;
const STEP = STAR_STEP;

const polar = (r: number, a: number): [number, number] => [Math.cos(a) * r, Math.sin(a) * r];

const EXTRUDE = { depth: 0.34, bevelEnabled: true, bevelThickness: 0.09, bevelSize: 0.07, bevelSegments: 4, curveSegments: 1 };

export function pointGeometry(k: number): ExtrudeGeometry {
  const a = Math.PI / 2 + k * STEP;
  const shape = new Shape();
  const [lx, ly] = polar(INNER, a - STEP / 2);
  const [tx, ty] = polar(OUTER, a);
  const [rx, ry] = polar(INNER, a + STEP / 2);
  shape.moveTo(lx * 0.96, ly * 0.96);
  shape.lineTo(tx, ty);
  shape.lineTo(rx * 0.96, ry * 0.96);
  shape.closePath();
  const geo = new ExtrudeGeometry(shape, EXTRUDE);
  geo.translate(0, 0, -EXTRUDE.depth / 2);
  return geo;
}

export function centerGeometry(): ExtrudeGeometry {
  const shape = new Shape();
  for (let k = 0; k < 5; k += 1) {
    const [x, y] = polar(INNER * 0.9, Math.PI / 2 + k * STEP + STEP / 2);
    if (k === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();
  const geo = new ExtrudeGeometry(shape, { ...EXTRUDE, depth: 0.42 });
  geo.translate(0, 0, -0.21);
  return geo;
}

