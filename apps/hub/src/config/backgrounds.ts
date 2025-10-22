/**
 * Background templates configuration for content creation
 */

export interface BackgroundTemplate {
  id: string;
  name: string;
  thumbnail: string;
  file: string;
  category: "islamic" | "solid" | "gradient";
  primaryColor?: string;
}

export const BACKGROUND_TEMPLATES: BackgroundTemplate[] = [
  // Islamic themed backgrounds
  {
    id: "islamic-lanterns-green",
    name: "Islamic Lanterns (Green)",
    thumbnail: "/backgrounds/islamic-lanterns-on-green.jpg",
    file: "/backgrounds/islamic-lanterns-on-green.jpg",
    category: "islamic",
    primaryColor: "#008080",
  },
  // Solid colors
  {
    id: "solid-green",
    name: "Solid Green",
    thumbnail: "",
    file: "",
    category: "solid",
    primaryColor: "#008080",
  },
  {
    id: "solid-teal",
    name: "Solid Teal",
    thumbnail: "",
    file: "",
    category: "solid",
    primaryColor: "#14b8a6",
  },
  {
    id: "solid-blue",
    name: "Solid Blue",
    thumbnail: "",
    file: "",
    category: "solid",
    primaryColor: "#0284c7",
  },
  {
    id: "solid-purple",
    name: "Solid Purple",
    thumbnail: "",
    file: "",
    category: "solid",
    primaryColor: "#7c3aed",
  },
  // Gradients
  {
    id: "gradient-teal",
    name: "Teal Gradient",
    thumbnail: "",
    file: "",
    category: "gradient",
    primaryColor: "linear-gradient(135deg, #0d9488 0%, #06b6d4 100%)",
  },
  {
    id: "gradient-green-blue",
    name: "Green to Blue",
    thumbnail: "",
    file: "",
    category: "gradient",
    primaryColor: "linear-gradient(135deg, #059669 0%, #0284c7 100%)",
  },
  {
    id: "gradient-purple-blue",
    name: "Purple to Blue",
    thumbnail: "",
    file: "",
    category: "gradient",
    primaryColor: "linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)",
  },
];

export const getBackgroundById = (
  id: string
): BackgroundTemplate | undefined => {
  return BACKGROUND_TEMPLATES.find((bg) => bg.id === id);
};

export const getBackgroundsByCategory = (
  category: BackgroundTemplate["category"]
): BackgroundTemplate[] => {
  return BACKGROUND_TEMPLATES.filter((bg) => bg.category === category);
};
