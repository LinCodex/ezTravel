export type LegalSection = {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
  note?: string;
};

export type LegalPageContent = {
  title: string;
  updated: string;
  intro: string[];
  sections: LegalSection[];
};
