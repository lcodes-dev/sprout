/**
 * Email Analytics Query Utilities
 *
 * Type-safe query functions for email analytics and reporting.
 */

import { and, count, eq, gte, isNotNull, lte, sql } from "drizzle-orm";
import { db } from "@/db/connection.js";
import { sentEmails } from "@/db/schema/sent-emails.js";

/**
 * Email statistics interface
 */
export interface EmailStats {
	totalSent: number;
	totalDelivered: number;
	totalBounced: number;
	totalFailed: number;
	totalOpened: number;
	totalClicked: number;
	deliveryRate: number;
	openRate: number;
	clickRate: number;
	byType: {
		notification: { sent: number; delivered: number };
		marketing: { sent: number; delivered: number };
	};
}

/**
 * Template performance statistics
 */
export interface TemplateStats {
	templateId: number;
	totalSent: number;
	totalDelivered: number;
	totalOpened: number;
	totalClicked: number;
	deliveryRate: number;
	openRate: number;
	clickRate: number;
}

/**
 * Email volume data for charts
 */
export interface VolumeData {
	date: string;
	sent: number;
	delivered: number;
	opened: number;
	clicked: number;
}

/**
 * Engagement metrics
 */
export interface EngagementStats {
	totalEmails: number;
	openedEmails: number;
	clickedEmails: number;
	openRate: number;
	clickRate: number;
	clickToOpenRate: number;
}

/**
 * Get comprehensive email statistics
 *
 * @param startDate - Optional start date for filtering
 * @param endDate - Optional end date for filtering
 * @returns Email statistics
 */
export async function getEmailStats(
	startDate?: Date,
	endDate?: Date,
): Promise<EmailStats> {
	// Build date filter conditions
	const dateConditions = [];
	if (startDate) {
		dateConditions.push(gte(sentEmails.sentAt, startDate));
	}
	if (endDate) {
		dateConditions.push(lte(sentEmails.sentAt, endDate));
	}

	const whereClause =
		dateConditions.length > 0 ? and(...dateConditions) : undefined;

	// Get all sent emails for the period
	const allEmails = await db
		.select()
		.from(sentEmails)
		.where(whereClause);

	// Calculate totals
	const totalSent = allEmails.length;
	const totalDelivered = allEmails.filter(
		(e) => e.deliveryStatus === "delivered" || e.deliveryStatus === "sent",
	).length;
	const totalBounced = allEmails.filter(
		(e) => e.deliveryStatus === "bounced",
	).length;
	const totalFailed = allEmails.filter(
		(e) => e.deliveryStatus === "failed",
	).length;
	const totalOpened = allEmails.filter((e) => e.openedAt !== null).length;
	const totalClicked = allEmails.filter((e) => e.clickedAt !== null).length;

	// Calculate rates
	const deliveryRate =
		totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0;
	const openRate =
		totalDelivered > 0 ? (totalOpened / totalDelivered) * 100 : 0;
	const clickRate = totalOpened > 0 ? (totalClicked / totalOpened) * 100 : 0;

	// Calculate by type
	const notificationEmails = allEmails.filter(
		(e) => e.emailType === "notification",
	);
	const marketingEmails = allEmails.filter((e) => e.emailType === "marketing");

	return {
		totalSent,
		totalDelivered,
		totalBounced,
		totalFailed,
		totalOpened,
		totalClicked,
		deliveryRate: Math.round(deliveryRate * 100) / 100,
		openRate: Math.round(openRate * 100) / 100,
		clickRate: Math.round(clickRate * 100) / 100,
		byType: {
			notification: {
				sent: notificationEmails.length,
				delivered: notificationEmails.filter(
					(e) => e.deliveryStatus === "delivered" || e.deliveryStatus === "sent",
				).length,
			},
			marketing: {
				sent: marketingEmails.length,
				delivered: marketingEmails.filter(
					(e) => e.deliveryStatus === "delivered" || e.deliveryStatus === "sent",
				).length,
			},
		},
	};
}

/**
 * Get performance statistics for a specific template
 *
 * @param templateId - The template ID
 * @returns Template performance statistics
 */
export async function getTemplatePerformance(
	templateId: number,
): Promise<TemplateStats> {
	const emails = await db
		.select()
		.from(sentEmails)
		.where(eq(sentEmails.templateId, templateId));

	const totalSent = emails.length;
	const totalDelivered = emails.filter(
		(e) => e.deliveryStatus === "delivered" || e.deliveryStatus === "sent",
	).length;
	const totalOpened = emails.filter((e) => e.openedAt !== null).length;
	const totalClicked = emails.filter((e) => e.clickedAt !== null).length;

	const deliveryRate =
		totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0;
	const openRate =
		totalDelivered > 0 ? (totalOpened / totalDelivered) * 100 : 0;
	const clickRate = totalOpened > 0 ? (totalClicked / totalOpened) * 100 : 0;

	return {
		templateId,
		totalSent,
		totalDelivered,
		totalOpened,
		totalClicked,
		deliveryRate: Math.round(deliveryRate * 100) / 100,
		openRate: Math.round(openRate * 100) / 100,
		clickRate: Math.round(clickRate * 100) / 100,
	};
}

/**
 * Get email volume over time for charts
 *
 * @param days - Number of days to look back
 * @returns Array of volume data by date
 */
export async function getEmailVolumeOverTime(
	days: number,
): Promise<VolumeData[]> {
	const startDate = new Date();
	startDate.setDate(startDate.getDate() - days);

	const emails = await db
		.select()
		.from(sentEmails)
		.where(gte(sentEmails.sentAt, startDate))
		.orderBy(sentEmails.sentAt);

	// Group by date
	const volumeMap = new Map<string, VolumeData>();

	for (const email of emails) {
		const dateStr = email.sentAt.toISOString().split("T")[0];

		if (!volumeMap.has(dateStr)) {
			volumeMap.set(dateStr, {
				date: dateStr,
				sent: 0,
				delivered: 0,
				opened: 0,
				clicked: 0,
			});
		}

		const data = volumeMap.get(dateStr);
		if (data) {
			data.sent++;
			if (
				email.deliveryStatus === "delivered" ||
				email.deliveryStatus === "sent"
			) {
				data.delivered++;
			}
			if (email.openedAt) {
				data.opened++;
			}
			if (email.clickedAt) {
				data.clicked++;
			}
		}
	}

	return Array.from(volumeMap.values()).sort(
		(a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
	);
}

/**
 * Get engagement metrics
 *
 * @param startDate - Optional start date for filtering
 * @param endDate - Optional end date for filtering
 * @returns Engagement statistics
 */
export async function getEngagementMetrics(
	startDate?: Date,
	endDate?: Date,
): Promise<EngagementStats> {
	const dateConditions = [];
	if (startDate) {
		dateConditions.push(gte(sentEmails.sentAt, startDate));
	}
	if (endDate) {
		dateConditions.push(lte(sentEmails.sentAt, endDate));
	}

	const whereClause =
		dateConditions.length > 0 ? and(...dateConditions) : undefined;

	const emails = await db
		.select()
		.from(sentEmails)
		.where(whereClause);

	const totalEmails = emails.length;
	const openedEmails = emails.filter((e) => e.openedAt !== null).length;
	const clickedEmails = emails.filter((e) => e.clickedAt !== null).length;

	const openRate = totalEmails > 0 ? (openedEmails / totalEmails) * 100 : 0;
	const clickRate = totalEmails > 0 ? (clickedEmails / totalEmails) * 100 : 0;
	const clickToOpenRate =
		openedEmails > 0 ? (clickedEmails / openedEmails) * 100 : 0;

	return {
		totalEmails,
		openedEmails,
		clickedEmails,
		openRate: Math.round(openRate * 100) / 100,
		clickRate: Math.round(clickRate * 100) / 100,
		clickToOpenRate: Math.round(clickToOpenRate * 100) / 100,
	};
}

/**
 * Get recent email activity
 *
 * @param limit - Number of recent emails to retrieve
 * @returns Array of recent sent emails
 */
export async function getRecentActivity(limit: number = 10) {
	return await db
		.select()
		.from(sentEmails)
		.orderBy(sql`${sentEmails.sentAt} DESC`)
		.limit(limit);
}
