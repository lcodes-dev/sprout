/**
 * Email Volume Chart Alpine.js Component
 *
 * Displays email volume over time using ApexCharts.
 */

export function emailVolumeChart() {
	return {
		chart: null,
		loading: false,

		async initChart() {
			this.loading = true;

			try {
				// Fetch analytics data
				const response = await fetch("/admin/emails/analytics?days=30");
				if (!response.ok) {
					throw new Error("Failed to load analytics");
				}

				const data = await response.json();
				const volumeData = data.volumeData || [];

				// Prepare chart data
				const dates = volumeData.map((d: { date: string }) => d.date);
				const sentData = volumeData.map((d: { sent: number }) => d.sent);
				const deliveredData = volumeData.map((d: { delivered: number }) => d.delivered);
				const openedData = volumeData.map((d: { opened: number }) => d.opened);

				// Initialize ApexCharts
				// Note: ApexCharts should be loaded globally or imported
				if (typeof ApexCharts === "undefined") {
					console.warn("ApexCharts not loaded");
					return;
				}

				const options = {
					series: [
						{
							name: "Sent",
							data: sentData,
						},
						{
							name: "Delivered",
							data: deliveredData,
						},
						{
							name: "Opened",
							data: openedData,
						},
					],
					chart: {
						type: "line",
						height: 256,
						toolbar: {
							show: false,
						},
					},
					colors: ["#3B82F6", "#10B981", "#F59E0B"],
					stroke: {
						width: 2,
						curve: "smooth",
					},
					xaxis: {
						categories: dates,
						labels: {
							formatter: (value: string) => {
								const date = new Date(value);
								return `${date.getMonth() + 1}/${date.getDate()}`;
							},
						},
					},
					yaxis: {
						title: {
							text: "Emails",
						},
					},
					tooltip: {
						shared: true,
						intersect: false,
					},
					legend: {
						position: "top",
						horizontalAlign: "right",
					},
				};

				this.chart = new ApexCharts(this.$refs.chartContainer, options);
				this.chart.render();
			} catch (error) {
				console.error("Error initializing chart:", error);
			} finally {
				this.loading = false;
			}
		},
	};
}
