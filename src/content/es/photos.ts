import type { Widen } from "@/i18n/config";
import { photos as enPhotos } from "../photos";

/** Same images, with Spanish alternative text. */
export const photos = {
  storyTime: {
    ...enPhotos.storyTime,
    alt: "Una maestra se inclina para compartir un libro ilustrado con dos niños pequeños, que sonríen mientras miran la página.",
  },
  ballPit: {
    ...enPhotos.ballPit,
    alt: "Un niño pequeño sonriente sentado en una piscina de pelotas de colores durante un juego sensorial.",
  },
  classroomPlay: {
    ...enPhotos.classroomPlay,
    alt: "Preescolares juegan con pelotas de colores y un tren de juguete sobre una alfombra del aula mientras dos maestras juegan con ellos en el piso.",
  },
  floorGame: {
    ...enPhotos.floorGame,
    alt: "Una educadora arrodillada en el piso, a la altura de los niños, juega un juego de parejas con imágenes con tres preescolares.",
  },
  parentChildWalk: {
    ...enPhotos.parentChildWalk,
    alt: "Una madre o padre y un niño pequeño caminan de la mano por un parque soleado.",
  },
} satisfies Widen<typeof enPhotos>;
