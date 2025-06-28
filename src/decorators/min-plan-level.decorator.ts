import { SetMetadata } from '@nestjs/common';

export const MIN_PLAN_LEVEL_KEY = 'minPlanLevel';
export const MinPlanLevel = (level: number) =>
  SetMetadata(MIN_PLAN_LEVEL_KEY, level);
