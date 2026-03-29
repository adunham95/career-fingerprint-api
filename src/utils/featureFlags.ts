export const FeatureFlags = {
  // Achievements
  AchievementsRead: 'achievements:read',
  AchievementsCreate: 'achievements:create',
  AchievementsUpdate: 'achievements:update',
  AchievementsDelete: 'achievements:delete',
  AchievementsDownload: 'achievements:download',
  AchievementsPrint: 'achievements:print',
  AchievementsGenerate: 'achievements:generate',
  AchievementsLink: 'achievements:link',

  // Achievement Tags
  AchievementTagsCreate: 'achievement-tags:create',
  AchievementTagsUpdate: 'achievement-tags:update',
  AchievementTagsDelete: 'achievement-tags:delete',
  AchievementTagsRead: 'achievement-tags:read',

  // Bullet Points
  BulletPointsCreate: 'bullet-points:create',
  BulletPointsUpdate: 'bullet-points:update',
  BulletPointsDelete: 'bullet-points:delete',
  BulletPointsRead: 'bullet-points:read',

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
  ResumeRead: 'resume:read',
  ResumeDuplicate: 'resume:duplicate',
  ResumeExportPDF: 'resume:download',

  // Cover Letters
  CoverLetterCreate: 'coverLetter:create',
  CoverLetterUpdate: 'coverLetter:update',
  CoverLetterDelete: 'coverLetter:delete',
  CoverLetterRead: 'coverLetter:read',
  CoverLetterDownload: 'coverLetter:download',

  // Job Applications
  JobAppCreate: 'jobApp:create',
  JobAppUpdate: 'jobApp:update',
  JobAppDelete: 'jobApp:delete',
  JobAppRead: 'jobApp:read',

  // Job Positions
  JobPositionCreate: 'jobPosition:create',
  JobPositionUpdate: 'jobPosition:update',
  JobPositionDelete: 'jobPosition:delete',
  JobPositionRead: 'jobPosition:Read',

  // Education
  EducationCreate: 'education:create',
  EducationUpdate: 'education:update',
  EducationDelete: 'education:delete',
  EducationRead: 'education:read',

  // Skills
  SkillsEdit: 'skills:edit',
  SkillsRead: 'skills:read',

  // Goals
  GoalsCreate: 'goals:create',
  GoalsRead: 'goals:read',
  GoalsUpdate: 'goals:update',
  GoalsDelete: 'goals:delete',

  // Notes
  NotesCreate: 'notes:create',
  NotesUpdate: 'notes:update',
  NotesDelete: 'notes:delete',
  NotesRead: 'notes:read',

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
