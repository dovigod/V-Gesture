


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
export interface ElementBoundary {
  id: string;
  dimension: number;
  boundary: Boundary;
}


export type RenderedElement<T extends Node> = T
export type HTMLValidElement = HTMLDivElement | HTMLAnchorElement | HTMLAnchorElement | HTMLAreaElement | HTMLAudioElement | HTMLBRElement | HTMLBaseElement | HTMLBodyElement | HTMLButtonElement | HTMLCanvasElement | HTMLDListElement | HTMLDetailsElement | HTMLDialogElement | HTMLFieldSetElement | HTMLFormControlsCollection | HTMLFormElement | HTMLFrameSetElementEventMap | HTMLHRElement | HTMLHeadingElement | HTMLIFrameElement | HTMLImageElement | HTMLInputElement | HTMLLIElement | HTMLLegendElement | HTMLLabelElement | HTMLLinkElement | HTMLMapElement | HTMLMediaElement | HTMLMenuElement | HTMLObjectElement | HTMLOptGroupElement | HTMLParagraphElement | HTMLPictureElement | HTMLPreElement | HTMLProgressElement | HTMLQuoteElement | HTMLSelectElement | HTMLSlotElement | HTMLSpanElement | HTMLTableCaptionElement | HTMLTableCellElement | HTMLTableColElement | HTMLTableElement | HTMLTableElement | HTMLTableRowElement | HTMLTableSectionElement | HTMLTextAreaElement | HTMLTimeElement | HTMLTitleElement | HTMLTrackElement | HTMLUListElement | HTMLVideoElement | HTMLOrSVGElement | HTMLOrSVGImageElement | Node;
