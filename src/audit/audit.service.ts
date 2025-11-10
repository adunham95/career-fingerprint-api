import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);
  constructor(private prisma: PrismaService) {}

  async logEvent(
    event: string,
    userID?: number,
    ipAddress?: string,
    details?: Record<string, any>,
  ) {
    await this.prisma.auditLog.create({
      data: { event, userID, ipAddress, details },
    });
  }

  getRecentLogs(days = 90) {
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    return this.prisma.auditLog.findMany({
      where: { createdAt: { gte: cutoff } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async cleanupOldLogs(days = 90) {
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    try {
      await this.prisma.auditLog.deleteMany({
        where: { createdAt: { lt: cutoff } },
      });
    } catch (error) {
      this.logger.error(error);
    }
  }
}
