export const LEVELS = ["S1", "S2", "S3", "S4"] as const;
export type LibraryLevel = (typeof LEVELS)[number];

export const SUBJECTS = [
  "Mathematics",
  "Biology",
  "Chemistry",
  "Physics",
  "English",
  "Geography",
  "History & Political Education",
  "Entrepreneurship",
  "ICT",
  "Agriculture",
  "CRE / IRE",
] as const;

export type LibrarySubject = (typeof SUBJECTS)[number];
export type ResourceType = "textbook" | "syllabus" | "teacher_guide" | "revision" | "notes" | "other";
export type ContentStatus = "available" | "metadata_only" | "restricted";

export interface LibraryResource {
  id: string;
  title: string;
  subject: LibrarySubject;
  level: LibraryLevel;
  curriculum: "Uganda Competency-Based Curriculum";
  resourceType: ResourceType;
  publisher: string | null;
  author: string | null;
  description: string | null;
  coverUrl: string | null;
  storagePath: string | null;
  documentUrl: string | null;
  sourceAttribution: string | null;
  contentStatus: ContentStatus;
  available: boolean;
}

// Metadata-only records keep discovery useful without claiming that unlicensed content is available.
export const CURRICULUM_RESOURCES: LibraryResource[] = LEVELS.flatMap((level, levelIndex) =>
  ["Mathematics", "Biology", "English", "ICT"].map((subject, subjectIndex) => ({
    id: `uganda-${level.toLowerCase()}-${subject.toLowerCase().replace(/[^a-z]+/g, "-")}`,
    title: `${level} ${subject} learning resource`,
    subject: subject as LibrarySubject,
    level,
    curriculum: "Uganda Competency-Based Curriculum" as const,
    resourceType: "textbook" as const,
    publisher: null,
    author: null,
    description:
      "Metadata placeholder. An approved or licensed curriculum resource can be attached after its source and reuse rights are verified.",
    coverUrl: null,
    storagePath: null,
    documentUrl: null,
    sourceAttribution: "Source and NCDC attribution pending verification",
    contentStatus: "metadata_only" as const,
    available: false,
  }))
);

export function getLibraryResource(id: string) {
  return CURRICULUM_RESOURCES.find((resource) => resource.id === id);
}

export function resourceTypeLabel(type: ResourceType) {
  return type.replace("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}
