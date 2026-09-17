import { prisma } from "./prisma";

export async function logAuditEvent({
  userId,
  userName,
  userEmail,
  action,
  details,
}: {
  userId?: string;
  userName: string;
  userEmail: string;
  action: string;
  details?: string;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        userName,
        userEmail,
        action,
        details,
      },
    });
  } catch (err) {
    console.error("Failed to write audit log entry:", err);
  }
}
