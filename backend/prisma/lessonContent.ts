export type LessonSpec = {
  topic: string;
  file: string;
  title: string;
  subtitle: string;
  sections: { heading: string; body: string[] }[];
};

/** Curriculum-aligned lesson notes for existing seed topics only. */
export const LESSONS: LessonSpec[] = [
  {
    topic: "Linear Equations",
    file: "linear-equations.pdf",
    title: "Linear Equations",
    subtitle: "Mathematics · Algebra Basics",
    sections: [
      {
        heading: "Learning objectives",
        body: [
          "Identify a linear equation in one variable.",
          "Solve equations of the form ax + b = c using inverse operations.",
          "Check solutions by substitution.",
        ],
      },
      {
        heading: "Key idea",
        body: [
          "A linear equation in one variable can be written as ax + b = 0, where a ≠ 0.",
          "Whatever operation you apply to one side must also be applied to the other side to keep the equation balanced.",
        ],
      },
      {
        heading: "Worked example",
        body: [
          "Solve: 3x − 7 = 8",
          "Step 1: Add 7 to both sides → 3x = 15",
          "Step 2: Divide both sides by 3 → x = 5",
          "Check: 3(5) − 7 = 15 − 7 = 8 ✓",
        ],
      },
      {
        heading: "Practice",
        body: [
          "1) 2x + 5 = 17",
          "2) 4x − 9 = 3",
          "3) 5(x − 2) = 20",
        ],
      },
    ],
  },
  {
    topic: "Polynomials",
    file: "polynomials.pdf",
    title: "Polynomials",
    subtitle: "Mathematics · Algebra Basics",
    sections: [
      {
        heading: "Learning objectives",
        body: [
          "Recognise terms, coefficients, and degree of a polynomial.",
          "Add and subtract polynomials by combining like terms.",
          "Multiply a monomial by a binomial.",
        ],
      },
      {
        heading: "Key idea",
        body: [
          "A polynomial is an expression with one or more terms of the form a·xⁿ, where n is a non-negative integer.",
          "Like terms have the same variable and the same power (for example, 3x² and −5x²).",
        ],
      },
      {
        heading: "Worked example",
        body: [
          "(2x² + 3x − 1) + (x² − 5x + 4) = 3x² − 2x + 3",
          "3x(x + 4) = 3x² + 12x",
        ],
      },
      {
        heading: "Practice",
        body: [
          "1) Simplify: (5x² − 2x) − (3x² + x − 6)",
          "2) Expand: 4x(2x − 3)",
          "3) State the degree of 7x³ − x + 1",
        ],
      },
    ],
  },
  {
    topic: "Triangles",
    file: "triangles.pdf",
    title: "Triangles",
    subtitle: "Mathematics · Geometry",
    sections: [
      {
        heading: "Learning objectives",
        body: [
          "Classify triangles by sides and by angles.",
          "Apply the angle-sum property of a triangle.",
          "Use the triangle inequality in simple cases.",
        ],
      },
      {
        heading: "Key idea",
        body: [
          "The sum of the interior angles of any triangle is 180°.",
          "Triangle inequality: the sum of any two sides must be greater than the third side.",
        ],
      },
      {
        heading: "Worked example",
        body: [
          "In △ABC, ∠A = 50° and ∠B = 60°. Find ∠C.",
          "∠C = 180° − 50° − 60° = 70°.",
        ],
      },
      {
        heading: "Practice",
        body: [
          "1) Can sides 3 cm, 4 cm, and 8 cm form a triangle? Why?",
          "2) An equilateral triangle has one angle of x°. Find x.",
          "3) In a right triangle, one acute angle is 35°. Find the other.",
        ],
      },
    ],
  },
  {
    topic: "Circles",
    file: "circles.pdf",
    title: "Circles",
    subtitle: "Mathematics · Geometry",
    sections: [
      {
        heading: "Learning objectives",
        body: [
          "Identify radius, diameter, chord, and circumference.",
          "Use C = 2πr and A = πr² in word problems.",
          "Relate diameter and radius: d = 2r.",
        ],
      },
      {
        heading: "Key idea",
        body: [
          "All points on a circle are at equal distance (the radius) from the centre.",
          "Use π ≈ 22/7 or 3.14 unless a question asks for an exact answer in terms of π.",
        ],
      },
      {
        heading: "Worked example",
        body: [
          "A circle has radius 7 cm. Find its circumference.",
          "C = 2πr = 2 × (22/7) × 7 = 44 cm.",
        ],
      },
      {
        heading: "Practice",
        body: [
          "1) Diameter is 14 cm. Find the radius.",
          "2) Radius is 3.5 cm. Find the area (use π = 22/7).",
          "3) Circumference is 31.4 cm. Estimate the radius (π = 3.14).",
        ],
      },
    ],
  },
  {
    topic: "Motion",
    file: "motion.pdf",
    title: "Motion",
    subtitle: "Science · Physics Intro",
    sections: [
      {
        heading: "Learning objectives",
        body: [
          "Distinguish distance and displacement.",
          "Calculate average speed: speed = distance ÷ time.",
          "Interpret simple distance–time graphs.",
        ],
      },
      {
        heading: "Key idea",
        body: [
          "Distance is the total path length travelled (scalar).",
          "Displacement is the shortest directed distance from start to finish (vector).",
          "Uniform motion means equal distances in equal intervals of time.",
        ],
      },
      {
        heading: "Worked example",
        body: [
          "A bus travels 90 km in 2 hours. Average speed = 90 ÷ 2 = 45 km/h.",
        ],
      },
      {
        heading: "Practice",
        body: [
          "1) A student walks 400 m to school in 10 minutes. Find speed in m/s.",
          "2) On a distance–time graph, what does a horizontal line mean?",
          "3) Give one example where distance and displacement are different.",
        ],
      },
    ],
  },
  {
    topic: "Force",
    file: "force.pdf",
    title: "Force",
    subtitle: "Science · Physics Intro",
    sections: [
      {
        heading: "Learning objectives",
        body: [
          "Define force as a push or a pull.",
          "State the SI unit of force (newton, N).",
          "Relate force, mass, and acceleration in words: F = ma.",
        ],
      },
      {
        heading: "Key idea",
        body: [
          "A force can change the speed, direction, or shape of an object.",
          "Balanced forces do not change motion; unbalanced forces do.",
          "Friction opposes relative motion between surfaces in contact.",
        ],
      },
      {
        heading: "Worked example",
        body: [
          "A force of 20 N acts on a 5 kg mass. Acceleration a = F/m = 20/5 = 4 m/s².",
        ],
      },
      {
        heading: "Practice",
        body: [
          "1) Name two contact forces and one non-contact force.",
          "2) Why is it harder to push a heavy box on a rough floor?",
          "3) If mass doubles and force stays the same, what happens to acceleration?",
        ],
      },
    ],
  },
  {
    topic: "Atoms",
    file: "atoms.pdf",
    title: "Atoms",
    subtitle: "Science · Chemistry Basics",
    sections: [
      {
        heading: "Learning objectives",
        body: [
          "Describe protons, neutrons, and electrons.",
          "Relate atomic number and mass number.",
          "Explain why atoms are electrically neutral overall.",
        ],
      },
      {
        heading: "Key idea",
        body: [
          "Atomic number (Z) = number of protons.",
          "Mass number (A) ≈ protons + neutrons.",
          "In a neutral atom, number of electrons = number of protons.",
        ],
      },
      {
        heading: "Worked example",
        body: [
          "Carbon-12: Z = 6, A = 12 → 6 protons, 6 neutrons, 6 electrons (neutral atom).",
        ],
      },
      {
        heading: "Practice",
        body: [
          "1) An atom has 11 protons and 12 neutrons. Find Z and A.",
          "2) Where are electrons found in a simple atomic model?",
          "3) What particle determines the identity of an element?",
        ],
      },
    ],
  },
  {
    topic: "Reactions",
    file: "reactions.pdf",
    title: "Chemical Reactions",
    subtitle: "Science · Chemistry Basics",
    sections: [
      {
        heading: "Learning objectives",
        body: [
          "Recognise reactants and products in a word equation.",
          "Identify signs that a chemical reaction may have occurred.",
          "Balance a simple chemical equation by inspection.",
        ],
      },
      {
        heading: "Key idea",
        body: [
          "In a chemical reaction, new substances form; atoms are rearranged, not created or destroyed.",
          "Common signs: colour change, gas release, temperature change, precipitate formation.",
        ],
      },
      {
        heading: "Worked example",
        body: [
          "Word equation: hydrogen + oxygen → water",
          "Balanced: 2H₂ + O₂ → 2H₂O",
        ],
      },
      {
        heading: "Practice",
        body: [
          "1) Balance: H₂ + Cl₂ → HCl",
          "2) Is melting ice a chemical change? Explain.",
          "3) Name the reactants in: zinc + hydrochloric acid → zinc chloride + hydrogen.",
        ],
      },
    ],
  },
  {
    topic: "Tenses",
    file: "tenses.pdf",
    title: "Verb Tenses",
    subtitle: "English · Grammar",
    sections: [
      {
        heading: "Learning objectives",
        body: [
          "Use present simple, past simple, and future simple correctly.",
          "Form negatives and questions in these tenses.",
          "Choose the tense that matches the time meaning of a sentence.",
        ],
      },
      {
        heading: "Key idea",
        body: [
          "Present simple: habits and facts → She walks to school.",
          "Past simple: completed actions → She walked yesterday.",
          "Future simple: decisions/predictions → She will walk tomorrow.",
        ],
      },
      {
        heading: "Worked example",
        body: [
          "Incorrect: He go to the market yesterday.",
          "Correct: He went to the market yesterday.",
        ],
      },
      {
        heading: "Practice",
        body: [
          "1) Rewrite in past simple: They play football every Sunday.",
          "2) Make a question: You will finish the project.",
          "3) Fill in: Water _____ (boil) at 100°C.",
        ],
      },
    ],
  },
  {
    topic: "Parts of Speech",
    file: "parts-of-speech.pdf",
    title: "Parts of Speech",
    subtitle: "English · Grammar",
    sections: [
      {
        heading: "Learning objectives",
        body: [
          "Identify nouns, pronouns, verbs, adjectives, and adverbs.",
          "Explain the role of prepositions and conjunctions in a sentence.",
          "Label parts of speech in short classroom sentences.",
        ],
      },
      {
        heading: "Key idea",
        body: [
          "Noun: names a person, place, thing, or idea.",
          "Verb: shows action or state of being.",
          "Adjective describes a noun; adverb often describes a verb.",
        ],
      },
      {
        heading: "Worked example",
        body: [
          "Sentence: The quick fox jumped over the lazy dog.",
          "quick/lazy = adjectives; jumped = verb; over = preposition; fox/dog = nouns.",
        ],
      },
      {
        heading: "Practice",
        body: [
          "1) Underline the verbs: Maya writes neatly and listens carefully.",
          "2) Circle the adjectives: A bright lamp lit the quiet room.",
          "3) Name the conjunction in: I stayed home because it rained.",
        ],
      },
    ],
  },
  {
    topic: "Short Stories",
    file: "short-stories.pdf",
    title: "Reading Short Stories",
    subtitle: "English · Literature",
    sections: [
      {
        heading: "Learning objectives",
        body: [
          "Identify setting, characters, conflict, and theme.",
          "Support answers with evidence from the text.",
          "Summarise a story in 4–6 clear sentences.",
        ],
      },
      {
        heading: "Key idea",
        body: [
          "A short story usually focuses on one main conflict and a limited number of characters.",
          "Theme is the underlying message; plot is the sequence of events.",
        ],
      },
      {
        heading: "Mini text (for class discussion)",
        body: [
          "Ravi found an old compass in his grandfather’s trunk. At first he thought it was broken,",
          "but when he stepped outside, the needle steadied toward the hills. That afternoon he",
          "followed it and discovered a path his grandfather had walked every Sunday—quiet,",
          "windy, and full of wildflowers. Ravi realised the compass was not broken; he had simply",
          "forgotten how to look up from his map.",
        ],
      },
      {
        heading: "Practice",
        body: [
          "1) Who is the main character, and what does he want?",
          "2) What is the turning point in the story?",
          "3) Suggest a theme in one sentence.",
        ],
      },
    ],
  },
  {
    topic: "Poetry",
    file: "poetry.pdf",
    title: "Reading Poetry",
    subtitle: "English · Literature",
    sections: [
      {
        heading: "Learning objectives",
        body: [
          "Identify simile, metaphor, and personification.",
          "Explain how word choice creates mood.",
          "Write a short personal response to a poem.",
        ],
      },
      {
        heading: "Key idea",
        body: [
          "Poets use imagery and sound devices (rhyme, rhythm, alliteration) to create meaning.",
          "Literal meaning is what the words say; figurative meaning is what they suggest.",
        ],
      },
      {
        heading: "Classroom poem",
        body: [
          "The chalkboard holds yesterday’s dust like a quiet shore,",
          "and chalk waves write new mornings across its grey.",
          "Outside, the peepal tree applause for every correct answer,",
          "while the bell keeps time for learning’s tide.",
        ],
      },
      {
        heading: "Practice",
        body: [
          "1) Find one metaphor or simile in the poem.",
          "2) What mood do the images create?",
          "3) Write two lines of your own about a classroom object using personification.",
        ],
      },
    ],
  },
];
