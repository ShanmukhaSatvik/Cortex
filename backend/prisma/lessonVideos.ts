export type LessonVideoSpec = {
  topic: string;
  title: string;
  description: string | null;
  /** Relative path under uploads/ (local MP4 — not YouTube). */
  file: string;
};

/**
 * Topic animations served as local MP4 files from seed-media.
 * Same demo clip is reused so seed stays light and playback works offline.
 */
export const LESSON_VIDEOS: LessonVideoSpec[] = [
  { topic: "Linear Equations", title: "Linear Equations", description: null, file: "demo.mp4" },
  { topic: "Polynomials", title: "Polynomial Expressions", description: null, file: "demo.mp4" },
  { topic: "Triangles", title: "Triangles", description: null, file: "demo.mp4" },
  { topic: "Circles", title: "Circles", description: null, file: "demo.mp4" },
  { topic: "Motion", title: "Motion in a Straight Line", description: null, file: "demo.mp4" },
  { topic: "Force", title: "Newton's Laws", description: null, file: "demo.mp4" },
  { topic: "Atoms", title: "Introduction to the Atom", description: null, file: "demo.mp4" },
  { topic: "Reactions", title: "Chemical Reactions", description: null, file: "demo.mp4" },
  { topic: "Tenses", title: "Verb Tenses", description: null, file: "demo.mp4" },
  { topic: "Parts of Speech", title: "Parts of Speech", description: null, file: "demo.mp4" },
  { topic: "Short Stories", title: "How and Why We Read", description: null, file: "demo.mp4" },
  { topic: "Poetry", title: "What Makes a Poem a Poem?", description: null, file: "demo.mp4" },
];
