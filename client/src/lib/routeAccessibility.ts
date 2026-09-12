export type RouteAccessibilityMeta = {
  title: string;
  announcement: string;
};

const routeTitles: Record<string, string> = {
  "/": "Home",
  "/kandas": "Kandas",
  "/wisdom": "Wisdom",
  "/characters": "Characters",
  "/places": "Places",
  "/guidance": "Guidance",
  "/stories": "Stories",
  "/quizzes": "Quizzes",
  "/audio": "Audio",
  "/search": "Search",
  "/ask": "Ask RamaVerse",
  "/intelligence": "Intelligence",
  "/library": "Library",
  "/journey": "Journey",
  "/timeline": "Timeline",
  "/knowledge": "Knowledge Graph",
  "/rama-life": "Rama Life",
  "/walk-with-rama": "Walk with Rama",
  "/owner-command-center": "Owner Command Center",
  "/experience-center": "Experience Center",
  "/reconciliation": "Reconciliation Workbench",
  "/404": "Page not found",
};

export function getRouteAccessibilityMeta(path: string): RouteAccessibilityMeta {
  const exactTitle = routeTitles[path];
  const title = exactTitle ?? (path.startsWith("/sargas/") ? "Sarga Reader" : "Page not found");

  return {
    title,
    announcement: `${title} page loaded`,
  };
}

export function getDocumentTitle(path: string) {
  const { title } = getRouteAccessibilityMeta(path);
  return title === "Home" ? "RamaVerse" : `${title} | RamaVerse`;
}
