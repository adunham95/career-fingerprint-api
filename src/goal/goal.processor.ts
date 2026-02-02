import { Process, Processor } from '@nestjs/bull';
import { GoalService } from './goal.service';
import { Job } from 'bull';
import { PrismaService } from 'src/prisma/prisma.service';

@Processor('goal')
export class GoalProcessor {
  constructor(
    private readonly goalService: GoalService,
    private readonly prisma: PrismaService,
  ) {}

  @Process('recalculateGoalProgress')
  async recalculateGoalProgress(
    job: Job<{
      userId: number;
      achievementId: string;
    }>,
  ) {
    console.log('running recalculateGoalProgress');
    const { userId, achievementId } = job.data;
    // const goals = await this.prisma.goal.findMany({
    //   where: { userID: userId, status: 'active' },
    // });

    // const addedAchievement = await this.prisma.achievement.findFirst({
    //   where: { id: achievementId },
    // });

    // if (!addedAchievement) {
    //   return;
    // }

    // for (const goal of goals) {
    //   const newPoints = this.goalService.calculateAchievementPoints(
    //     goal,
    //     addedAchievement,
    //   );

    //   if (newPoints > 0) {
    //     const target = goal.targetCount ?? 0;
    //     const currentPoints = goal.currentPoints ?? 0;
    //     const totalPoints = newPoints + currentPoints;

    //     let progress = 0;
    //     if (target > 0) {
    //       progress = totalPoints / target;
    //     }

    //     console.log('progress', {
    //       goalID: goal.id,
    //       progress,
    //       totalPoints,
    //       newPoints,
    //       currentPoints,
    //     });

    //     // Optional: cap progress at 100%
    //     progress = Math.min(progress, 1);

    //     console.log('mined progress:', progress);

    //     await this.prisma.goal.update({
    //       where: { id: goal.id },
    //       data: {
    //         progress,
    //         lastProgressCalculatedAt: new Date(),
    //         currentPoints: totalPoints,
    //         linkedAchievements: { connect: { id: achievementId } },
    //       },
    //     });

    //     if (progress >= 1) {
    //       await this.goalService.completeGoal(goal.id);
    //     }
    //   }
    // }
  }
}
