export const JobApplicationStatus = {
  APPLIED: 'applied',
  INTERVIEWING: 'interviewing',
  NEGOTIATING: 'negotiating',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  GHOSTED: 'ghosted',
} as const;

export type JobApplicationStatu =
  (typeof JobApplicationStatus)[keyof typeof JobApplicationStatus];
