export const FeatureFlags = {
  //Generated
  CreateResumes: 'resumes:create',
  ExportPDF: 'resumes:export',
} as const;

export type FeatureFlag = (typeof FeatureFlags)[keyof typeof FeatureFlags];
