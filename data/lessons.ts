export interface Lesson {
  id: number;
  title: string;
  duration: string;
  completed: boolean;
  module: string;
  slug: string;
}

export const lessons: Lesson[] = [
  {
    id: 1,
    module: "Getting Started",
    title: "Welcome & Course Overview",
    duration: "3:24",
    completed: true,
    slug: "welcome-course-overview",
  },
  {
    id: 2,
    module: "Getting Started",
    title: "Setting Up Your Environment",
    duration: "8:12",
    completed: true,
    slug: "setting-up-your-environment",
  },
  {
    id: 3,
    module: "Getting Started",
    title: "Understanding the Basics",
    duration: "12:45",
    completed: true,
    slug: "understanding-the-basics",
  },
  {
    id: 4,
    module: "Core Concepts",
    title: "Components & Architecture",
    duration: "15:30",
    completed: false,
    slug: "components-and-architecture",
  },
  {
    id: 5,
    module: "Core Concepts",
    title: "State Management Deep Dive",
    duration: "18:22",
    completed: false,
    slug: "state-management-deep-dive",
  },
  {
    id: 6,
    module: "Core Concepts",
    title: "Routing & Navigation",
    duration: "11:08",
    completed: false,
    slug: "routing-and-navigation",
  },
  {
    id: 7,
    module: "Core Concepts",
    title: "Working with APIs",
    duration: "14:55",
    completed: false,
    slug: "working-with-apis",
  },
  {
    id: 8,
    module: "Advanced",
    title: "Performance Optimization",
    duration: "20:10",
    completed: false,
    slug: "performance-optimization",
  },
  {
    id: 9,
    module: "Advanced",
    title: "Testing Strategies",
    duration: "16:33",
    completed: false,
    slug: "testing-strategies",
  },
  {
    id: 10,
    module: "Advanced",
    title: "Deployment & CI/CD",
    duration: "9:47",
    completed: false,
    slug: "deployment-and-ci-cd",
  },
];
