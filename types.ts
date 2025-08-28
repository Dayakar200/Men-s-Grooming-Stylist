export enum Hairstyle {
  None = "None",
  BuzzCut = "Buzz Cut",
  CrewCut = "Crew Cut",
  Fade = "Fade",
  Pompadour = "Pompadour",
  Quiff = "Quiff",
  SlickBack = "Slick Back",
  ManBun = "Man Bun",
}

export enum BeardStyle {
  None = "None",
  CleanShaven = "Clean Shaven",
  Goatee = "Goatee",
  VanDyke = "Van Dyke",
  FullBeard = "Full Beard",
  Stubble = "Stubble",
  MuttonChops = "Mutton Chops",
}

export type StyleOptions = {
  hairstyle: Hairstyle;
  beardStyle: BeardStyle;
  colorPrompt: string;
  textPrompt: string;
  referenceImage: string | null;
};

export type StylePreset = {
  name: string;
  options: StyleOptions;
};

export type StyleRecommendation = {
  hairstyle: Hairstyle;
  beardStyle: BeardStyle;
  reason: string;
};

export type FaceShapeAnalysisResult = {
  faceShape: string;
  description: string;
  reasoning: string;
  recommendations: StyleRecommendation[];
};
