export type ResearchItem = {
  title: string;
  author: string;
  year: string;
  category: "NBI Research" | "Hockey Analytics" | "Team Building" | "Methodology" | "Player Evaluation";
  type: "PDF" | "Article" | "Study" | "Resource";
  description: string;
  url: string;
};

export const researchItems: ResearchItem[] = [
  {
    title: "The Cost of Falling Behind",
    author: "NBI Hockey",
    year: "2026",
    category: "NBI Research",
    type: "Study",
    description:
      "A look at how difficult it is for NHL teams to climb back into playoff position after falling five or more points behind.",
    url: "https://nbihockey.substack.com",
  },
  {
    title: "Secondary Assist Repeatability Study",
    author: "NBI Hockey",
    year: "2026",
    category: "NBI Research",
    type: "Study",
    description:
      "An analysis of whether secondary assists are repeatable indicators of offensive contribution for NHL forwards.",
    url: "https://nbihockey.substack.com",
  },
  {
    title: "Example External Hockey Analytics Paper",
    author: "External Author",
    year: "2024",
    category: "Hockey Analytics",
    type: "PDF",
    description:
      "Placeholder example for a public PDF, article, or research resource that can be replaced with a real link later.",
    url: "#",
  },
];