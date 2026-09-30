/** Client photography (from the current STARS site) with its original alt text. */
export const photos = {
  storyTime: {
    src: "/photos/story-time-close.webp",
    width: 1200,
    height: 1800,
    alt: "A teacher leans in to share a picture book with two young children, who smile as they look at the page.",
  },
  ballPit: {
    src: "/photos/ball-pit-play.webp",
    width: 1200,
    height: 800,
    alt: "A smiling toddler sits in a colorful ball pit during sensory play.",
  },
  classroomPlay: {
    src: "/photos/classroom-play.webp",
    width: 1200,
    height: 801,
    alt: "Preschoolers play with colorful balls and a toy train on a classroom rug while two teachers join in on the floor.",
  },
  floorGame: {
    src: "/photos/floor-game.webp",
    width: 1200,
    height: 801,
    alt: "An educator kneels on the floor at children's eye level, playing a picture-matching game with three preschoolers.",
  },
  parentChildWalk: {
    src: "/photos/parent-child-walk.webp",
    width: 1200,
    height: 800,
    alt: "A parent and young child walk hand in hand across a sunny park lawn.",
  },
} as const;

export type Photo = (typeof photos)[keyof typeof photos];
