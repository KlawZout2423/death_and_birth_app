import { prisma } from "./prisma";
import { NotificationStatus } from "../../generated/client";

export async function notifyInstitutions(deathRecordId: string) {
  try {
    const institutions = await prisma.institution.findMany({
      where: {
        type: {
          in: ["BANK", "INSURANCE", "PENSION"]
        },
        status: true
      }
    });

    if (institutions.length === 0) return;

    const notifications = institutions.map(inst => ({
      deathRecordId,
      institutionId: inst.id,
      status: NotificationStatus.SENT,
      sentAt: new Date()
    }));

    await prisma.notification.createMany({
      data: notifications
    });

    console.log(`Successfully notified ${institutions.length} institutions for record ${deathRecordId}`);
  } catch (error) {
    console.error("Failed to notify institutions:", error);
  }
}
