import { SetMetadata } from '@nestjs/common';
import { FeatureFlag } from 'src/utils/featureFlags';

export const HAS_FEATURE_KEY = 'hasFeature';
export const HasFeature = (feature: FeatureFlag) =>
  SetMetadata(HAS_FEATURE_KEY, feature);
