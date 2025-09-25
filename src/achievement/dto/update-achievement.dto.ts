import { PartialType } from '@nestjs/swagger';
import { CreateAchievementDto } from './create-achievement.dto';
import { Education, Prisma } from '@prisma/client';

export class UpdateAchievementDto extends PartialType(CreateAchievementDto) {
  education?: Education;
}

export function mapAchievementUpdateDto(
  dto: UpdateAchievementDto,
): Prisma.AchievementUpdateInput {
  const data: Prisma.AchievementUpdateInput = {
    description: dto.description,
    result: dto.result,
    myContribution: dto.myContribution,
    startDate: dto.startDate ? new Date(dto.startDate) : undefined,
    endDate: dto.endDate ? new Date(dto.endDate) : undefined,
  };

  if (dto.jobPositionID) {
    data.jobPosition = { connect: { id: dto.jobPositionID } };
  } else {
    data.jobPosition = { disconnect: true };
  }

  if (dto.educationID) {
    data.education = { connect: { id: dto.educationID } };
  } else {
    data.education = { disconnect: true };
  }

  return data;
}
