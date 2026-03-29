export const FeatureFlags = {
  // Achievements
  AchievementsCreate: 'achievements:create',
  AchievementsUpdate: 'achievements:update',
  AchievementsDelete: 'achievements:delete',
  AchievementsDownload: 'achievements:download',
  AchievementsPrint: 'achievements:print',
  AchievementsGenerate: 'achievements:generate',

  // Achievement Tags
  AchievementTagsCreate: 'achievement-tags:create',
  AchievementTagsUpdate: 'achievement-tags:update',
  AchievementTagsDelete: 'achievement-tags:delete',

  // Bullet Points
  BulletPointsCreate: 'bullet-points:create',
  BulletPointsUpdate: 'bullet-points:update',
  BulletPointsDelete: 'bullet-points:delete',

  // Meetings
  MeetingView: 'meeting:view',
  MeetingCreate: 'meeting:create',
  MeetingUpdate: 'meeting:update',
  MeetingDelete: 'meeting:delete',
  MeetingCheatSheet: 'meeting:cheatSheet',
  MeetingPrep: 'meeting:prep',
  MeetingNotesDownload: 'meetingNotes:download',

  // Resumes
  ResumeCreate: 'resume:create',
  ResumeUpdate: 'resume:update',
  ResumeDelete: 'resume:delete',
  ResumeDuplicate: 'resume:duplicate',
  ResumeExportPDF: 'resume:download',

  // Cover Letters
  CoverLetterCreate: 'coverLetter:create',
  CoverLetterUpdate: 'coverLetter:update',
  CoverLetterDelete: 'coverLetter:delete',
  CoverLetterDownload: 'coverLetter:download',

  // Job Applications
  JobAppCreate: 'jobApp:create',
  JobAppUpdate: 'jobApp:update',
  JobAppDelete: 'jobApp:delete',

  // Job Positions
  JobPositionCreate: 'jobPosition:create',
  JobPositionUpdate: 'jobPosition:update',
  JobPositionDelete: 'jobPosition:delete',

  // Education
  EducationCreate: 'education:create',
  EducationUpdate: 'education:update',
  EducationDelete: 'education:delete',

  // Skills
  SkillsEdit: 'skills:edit',

  // Goals
  GoalsCreate: 'goals:create',

  // Notes
  NotesCreate: 'notes:create',
  NotesUpdate: 'notes:update',
  NotesDelete: 'notes:delete',

  // Highlights
  HighlightsView: 'highlights:view',
  HighlightsCreate: 'highlights:create',

  // Thank Yous
  ThankYouCreate: 'thank-you:create',
  ThankYouUpdate: 'thank-you:update',
  ThankYouDelete: 'thank-you:delete',

  // Weekly Email Sends
  WeeklyEmailSend: 'weekly-email:send',

  // Org / Coach
  OrgCreatePromoCode: 'org:createPromoCode',
  OrgCreateCustomPromoCode: 'org:createCustomPromoCode',
} as const;

export type FeatureFlag = (typeof FeatureFlags)[keyof typeof FeatureFlags];
