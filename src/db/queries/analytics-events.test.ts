/**
 * Tests for Analytics Events Queries
 */

import { beforeEach, describe, expect, it } from "vitest";
import { db } from "@/db/connection.js";
import { analyticsEvents } from "@/db/schema/analytics-events.js";
import {
	getBrowserStats,
	getReferrerStats,
	getTimeSeriesData,
	getTopPages,
	getTotalViews,
	getUniqueVisitors,
	insertAnalyticsEvents,
} from "./analytics-events.js";

describe("Analytics Events Queries", () => {
	beforeEach(async () => {
		// Clear analytics events table before each test
		await db.delete(analyticsEvents);
	});

	describe("insertAnalyticsEvents", () => {
		it("should insert multiple events", async () => {
			const events = [
				{
					anonymizedIp: "192.168.1.0",
					userAgent: "Mozilla/5.0 Chrome/120.0",
					path: "/",
					referer: null,
					timestamp: new Date(),
				},
				{
					anonymizedIp: "10.0.0.0",
					userAgent: "Mozilla/5.0 Firefox/120.0",
					path: "/about",
					referer: "https://google.com",
					timestamp: new Date(),
				},
			];

			const result = await insertAnalyticsEvents(events);

			expect(result).toHaveLength(2);
			expect(result[0].anonymizedIp).toBe("192.168.1.0");
			expect(result[1].anonymizedIp).toBe("10.0.0.0");
		});

		it("should return empty array for empty input", async () => {
			const result = await insertAnalyticsEvents([]);

			expect(result).toEqual([]);
		});
	});

	describe("getTotalViews", () => {
		it("should count total views", async () => {
			const now = new Date();

			await insertAnalyticsEvents([
				{
					anonymizedIp: "192.168.1.0",
					userAgent: "Mozilla/5.0",
					path: "/",
					referer: null,
					timestamp: now,
				},
				{
					anonymizedIp: "10.0.0.0",
					userAgent: "Mozilla/5.0",
					path: "/about",
					referer: null,
					timestamp: now,
				},
				{
					anonymizedIp: "172.16.0.0",
					userAgent: "Mozilla/5.0",
					path: "/contact",
					referer: null,
					timestamp: now,
				},
			]);

			const total = await getTotalViews();

			expect(total).toBe(3);
		});

		it("should filter by days", async () => {
			const now = new Date();
			const threeDaysAgo = new Date();
			threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
			const tenDaysAgo = new Date();
			tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

			await insertAnalyticsEvents([
				{
					anonymizedIp: "192.168.1.0",
					userAgent: "Mozilla/5.0",
					path: "/",
					referer: null,
					timestamp: now,
				},
				{
					anonymizedIp: "10.0.0.0",
					userAgent: "Mozilla/5.0",
					path: "/about",
					referer: null,
					timestamp: threeDaysAgo,
				},
				{
					anonymizedIp: "172.16.0.0",
					userAgent: "Mozilla/5.0",
					path: "/contact",
					referer: null,
					timestamp: tenDaysAgo,
				},
			]);

			const last7Days = await getTotalViews(7);

			expect(last7Days).toBe(2); // Only events within 7 days
		});
	});

	describe("getTopPages", () => {
		it("should return top pages ordered by views", async () => {
			const now = new Date();

			await insertAnalyticsEvents([
				{
					anonymizedIp: "192.168.1.0",
					userAgent: "Mozilla/5.0",
					path: "/",
					referer: null,
					timestamp: now,
				},
				{
					anonymizedIp: "10.0.0.0",
					userAgent: "Mozilla/5.0",
					path: "/",
					referer: null,
					timestamp: now,
				},
				{
					anonymizedIp: "172.16.0.0",
					userAgent: "Mozilla/5.0",
					path: "/",
					referer: null,
					timestamp: now,
				},
				{
					anonymizedIp: "192.168.2.0",
					userAgent: "Mozilla/5.0",
					path: "/about",
					referer: null,
					timestamp: now,
				},
				{
					anonymizedIp: "10.0.1.0",
					userAgent: "Mozilla/5.0",
					path: "/about",
					referer: null,
					timestamp: now,
				},
				{
					anonymizedIp: "172.16.1.0",
					userAgent: "Mozilla/5.0",
					path: "/contact",
					referer: null,
					timestamp: now,
				},
			]);

			const topPages = await getTopPages(10);

			expect(topPages).toHaveLength(3);
			expect(topPages[0].path).toBe("/");
			expect(topPages[0].views).toBe(3);
			expect(topPages[1].path).toBe("/about");
			expect(topPages[1].views).toBe(2);
			expect(topPages[2].path).toBe("/contact");
			expect(topPages[2].views).toBe(1);
		});

		it("should respect limit parameter", async () => {
			const now = new Date();

			await insertAnalyticsEvents([
				{
					anonymizedIp: "192.168.1.0",
					userAgent: "Mozilla/5.0",
					path: "/page1",
					referer: null,
					timestamp: now,
				},
				{
					anonymizedIp: "10.0.0.0",
					userAgent: "Mozilla/5.0",
					path: "/page2",
					referer: null,
					timestamp: now,
				},
				{
					anonymizedIp: "172.16.0.0",
					userAgent: "Mozilla/5.0",
					path: "/page3",
					referer: null,
					timestamp: now,
				},
			]);

			const topPages = await getTopPages(2);

			expect(topPages).toHaveLength(2);
		});
	});

	describe("getBrowserStats", () => {
		it("should extract and count browsers", async () => {
			const now = new Date();

			await insertAnalyticsEvents([
				{
					anonymizedIp: "192.168.1.0",
					userAgent: "Mozilla/5.0 Chrome/120.0",
					path: "/",
					referer: null,
					timestamp: now,
				},
				{
					anonymizedIp: "10.0.0.0",
					userAgent: "Mozilla/5.0 Chrome/120.0",
					path: "/",
					referer: null,
					timestamp: now,
				},
				{
					anonymizedIp: "172.16.0.0",
					userAgent: "Mozilla/5.0 Firefox/120.0",
					path: "/",
					referer: null,
					timestamp: now,
				},
			]);

			const browsers = await getBrowserStats();

			expect(browsers).toHaveLength(2);
			expect(browsers[0].browser).toBe("Chrome");
			expect(browsers[0].views).toBe(2);
			expect(browsers[1].browser).toBe("Firefox");
			expect(browsers[1].views).toBe(1);
		});
	});

	describe("getReferrerStats", () => {
		it("should count referrers", async () => {
			const now = new Date();

			await insertAnalyticsEvents([
				{
					anonymizedIp: "192.168.1.0",
					userAgent: "Mozilla/5.0",
					path: "/",
					referer: "https://google.com",
					timestamp: now,
				},
				{
					anonymizedIp: "10.0.0.0",
					userAgent: "Mozilla/5.0",
					path: "/",
					referer: "https://google.com",
					timestamp: now,
				},
				{
					anonymizedIp: "172.16.0.0",
					userAgent: "Mozilla/5.0",
					path: "/",
					referer: null,
					timestamp: now,
				},
			]);

			const referrers = await getReferrerStats(10);

			expect(referrers).toHaveLength(2);
			expect(referrers[0].referrer).toBe("https://google.com");
			expect(referrers[0].views).toBe(2);
			expect(referrers[1].referrer).toBe("Direct");
			expect(referrers[1].views).toBe(1);
		});
	});

	describe("getUniqueVisitors", () => {
		it("should count unique anonymized IPs", async () => {
			const now = new Date();

			await insertAnalyticsEvents([
				{
					anonymizedIp: "192.168.1.0",
					userAgent: "Mozilla/5.0",
					path: "/",
					referer: null,
					timestamp: now,
				},
				{
					anonymizedIp: "192.168.1.0",
					userAgent: "Mozilla/5.0",
					path: "/about",
					referer: null,
					timestamp: now,
				},
				{
					anonymizedIp: "10.0.0.0",
					userAgent: "Mozilla/5.0",
					path: "/",
					referer: null,
					timestamp: now,
				},
			]);

			const uniqueVisitors = await getUniqueVisitors(7);

			expect(uniqueVisitors).toBe(2);
		});
	});

	describe("getTimeSeriesData", () => {
		it("should group by day", async () => {
			const today = new Date();
			const yesterday = new Date();
			yesterday.setDate(yesterday.getDate() - 1);

			await insertAnalyticsEvents([
				{
					anonymizedIp: "192.168.1.0",
					userAgent: "Mozilla/5.0",
					path: "/",
					referer: null,
					timestamp: today,
				},
				{
					anonymizedIp: "10.0.0.0",
					userAgent: "Mozilla/5.0",
					path: "/",
					referer: null,
					timestamp: today,
				},
				{
					anonymizedIp: "172.16.0.0",
					userAgent: "Mozilla/5.0",
					path: "/",
					referer: null,
					timestamp: yesterday,
				},
			]);

			const timeSeries = await getTimeSeriesData(7, "day");

			expect(timeSeries.length).toBeGreaterThanOrEqual(1);
			expect(timeSeries[0]).toHaveProperty("timestamp");
			expect(timeSeries[0]).toHaveProperty("views");
		});
	});
});
