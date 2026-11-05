/**
 * Every project on the site lives here. To add one, add an entry:
 * it appears on /work, gets its own /work/<slug> page, and (if `featured`)
 * shows on the home page. Text in [square brackets] is a placeholder.
 */

export type ProjectType = "Apps" | "AI" | "Tools";
export type ProjectStatus = "Building" | "In progress" | "Side project" | "Completed" | "Planned";

export interface CaseStudy {
  problem: string;
  built: string;
  decisions: string;
  learned: string;
}

export interface Project {
  slug: string;
  title: string;
  glyph: string;
  type: ProjectType;
  kind: string;
  status: ProjectStatus;
  summary: string;
  tags: string[];
  featured?: boolean;
  /** Links to the playable demo on /play. */
  playable?: boolean;
  caseStudy: CaseStudy;
}

const placeholderCaseStudy: CaseStudy = {
  problem: "[What needed solving, and for whom.]",
  built: "[The product, in a few sentences.]",
  decisions: "[The tradeoffs you weighed and why you chose what you did.]",
  learned: "[What changed for you, and what you'd do next.]",
};

export const projects: Project[] = [
  {
    slug: "haven",
    title: "Haven",
    glyph: "H",
    type: "Apps",
    kind: "Company · CEO",
    status: "Building",
    summary: "[One line on what Haven is and who it's for.]",
    tags: ["Founder", "Product"],
    featured: true,
    caseStudy: placeholderCaseStudy,
  },
  {
    slug: "unprompted",
    title: "unprompted.cool",
    glyph: "u",
    type: "Apps",
    kind: "Web app",
    status: "Side project",
    summary: "One-minute speaking prompts that help you think on your feet.",
    tags: ["Product design", "Web"],
    featured: true,
    caseStudy: placeholderCaseStudy,
  },
  {
    slug: "quoridor-ai",
    title: "Quoridor AI",
    glyph: "Q",
    type: "AI",
    kind: "AI · Self-play",
    status: "In progress",
    summary: "An AlphaZero-style agent that learns the board game Quoridor by playing against itself.",
    tags: ["Reinforcement learning", "Self-play", "Python"],
    featured: true,
    playable: true,
    caseStudy: placeholderCaseStudy,
  },
  {
    slug: "treasure-maze-ai",
    title: "Treasure Maze AI",
    glyph: "T",
    type: "AI",
    kind: "AI · Coursework",
    status: "Completed",
    summary:
      "A game where an AI learns to find its way through a maze to the treasure, built for a machine learning course.",
    tags: ["Machine learning", "Pathfinding"],
    caseStudy: placeholderCaseStudy,
  },
  {
    slug: "dungeon-crawler",
    title: "Dungeon Crawler",
    glyph: "D",
    type: "AI",
    kind: "AI · Game",
    status: "Planned",
    summary: "A dungeon crawler whose enemies learn from the way you play.",
    tags: ["Reinforcement learning", "Game design"],
    caseStudy: placeholderCaseStudy,
  },
  {
    slug: "rl-playground",
    title: "RL Playground",
    glyph: "R",
    type: "Tools",
    kind: "Tool",
    status: "Planned",
    summary: "A level editor where you build a world and watch an agent learn to solve it.",
    tags: ["Reinforcement learning", "Tooling"],
    caseStudy: placeholderCaseStudy,
  },
];

export const projectTypes: ("All" | ProjectType)[] = ["All", "Apps", "AI", "Tools"];

export const getProject = (slug: string) => projects.find((p) => p.slug === slug);
