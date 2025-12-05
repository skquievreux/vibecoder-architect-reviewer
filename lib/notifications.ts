import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export type NotificationType =
  | "SECURITY"
  | "DEPLOYMENT"
  | "HEALTH"
  | "TASK"
  | "SYSTEM";

export type NotificationSeverity =
  | "CRITICAL"
  | "HIGH"
  | "MEDIUM"
  | "LOW"
  | "INFO";

interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  severity: NotificationSeverity;
  title: string;
  message: string;
  metadata?: Record<string, any>;
  link?: string;
}

/**
 * Create a notification for a user
 */
export async function createNotification(params: CreateNotificationParams) {
  const { userId, type, severity, title, message, metadata, link } = params;

  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        severity,
        title,
        message,
        metadata: metadata ? JSON.stringify(metadata) : null,
        link,
      },
    });

    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
}

/**
 * Create notifications for all users with a specific role
 */
export async function createNotificationForRole(
  role: string,
  params: Omit<CreateNotificationParams, "userId">
) {
  try {
    const users = await prisma.user.findMany({
      where: { role },
      select: { id: true },
    });

    const notifications = await Promise.all(
      users.map((user) =>
        createNotification({
          ...params,
          userId: user.id,
        })
      )
    );

    return notifications;
  } catch (error) {
    console.error("Error creating notifications for role:", error);
    throw error;
  }
}

/**
 * Create notifications for all admins
 */
export async function notifyAdmins(
  params: Omit<CreateNotificationParams, "userId">
) {
  return createNotificationForRole("ADMIN", params);
}

/**
 * Create security vulnerability notification
 */
export async function notifySecurityVulnerability(
  userId: string,
  vulnerability: {
    severity: string;
    title: string;
    repositoryName?: string;
    cveId?: string;
  }
) {
  const severityMap: Record<string, NotificationSeverity> = {
    CRITICAL: "CRITICAL",
    HIGH: "HIGH",
    MEDIUM: "MEDIUM",
    LOW: "LOW",
  };

  return createNotification({
    userId,
    type: "SECURITY",
    severity: severityMap[vulnerability.severity] || "MEDIUM",
    title: `Security vulnerability detected${
      vulnerability.repositoryName ? ` in ${vulnerability.repositoryName}` : ""
    }`,
    message: vulnerability.title,
    metadata: {
      cveId: vulnerability.cveId,
      repositoryName: vulnerability.repositoryName,
    },
    link: vulnerability.repositoryName
      ? `/security?repo=${vulnerability.repositoryName}`
      : "/security",
  });
}

/**
 * Create deployment notification
 */
export async function notifyDeployment(
  userId: string,
  deployment: {
    status: "SUCCESS" | "FAILED";
    repositoryName: string;
    environment: string;
  }
) {
  return createNotification({
    userId,
    type: "DEPLOYMENT",
    severity: deployment.status === "FAILED" ? "HIGH" : "INFO",
    title: `Deployment ${
      deployment.status === "SUCCESS" ? "successful" : "failed"
    }`,
    message: `${deployment.repositoryName} deployment to ${deployment.environment} ${deployment.status.toLowerCase()}`,
    metadata: deployment,
  });
}

/**
 * Create health issue notification
 */
export async function notifyHealthIssue(
  userId: string,
  issue: {
    repositoryName: string;
    issueType: string;
    severity: NotificationSeverity;
  }
) {
  return createNotification({
    userId,
    type: "HEALTH",
    severity: issue.severity,
    title: `Health issue in ${issue.repositoryName}`,
    message: `${issue.issueType} detected`,
    metadata: issue,
    link: `/repos/${issue.repositoryName}`,
  });
}
