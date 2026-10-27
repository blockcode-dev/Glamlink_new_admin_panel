import React from "react";
import { Line } from "react-chartjs-2";
import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
  type ChartData,
  type ChartOptions,
} from "chart.js";
import dayjs from "dayjs";
// Chart.js draws on a canvas, which can't read var(--…), so the chart takes the tokens from index.css.
import { cssVar } from "../../config/theme";
import type { DayCounts } from "./analytics";
import styles from "./ProfilePages.module.scss";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

/**
 * Views and clicks by day: two lines on one count axis, views blue and clicks coral (as everywhere on the page).
 * Hovering a day shows both counts.
 */
const DailyChart = ({ days }: { days: DayCounts[] }) => {
  const ink = cssVar("--color-text-secondary");
  const rule = cssVar("--color-border");
  const surface = cssVar("--color-surface");
  // One day draws no line: its dots carry it.
  const dots = days.length === 1 ? 4 : 0;
  const line = (label: string, color: string, counts: number[]) => ({
    label,
    data: counts,
    borderColor: color,
    backgroundColor: color,
    borderWidth: 2,
    pointRadius: dots,
    pointHoverRadius: 5,
    pointHitRadius: 12,
    pointBorderColor: surface,
    pointBorderWidth: 2,
  });

  const data: ChartData<"line"> = {
    labels: days.map((d) => dayjs(d.date).format("MMM D")),
    datasets: [
      line("Views", cssVar("--color-accent-blue"), days.map((d) => d.views)),
      line("Clicks", cssVar("--color-accent-coral"), days.map((d) => d.clicks)),
    ],
  };

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: { position: "top", align: "start", labels: { color: ink, boxWidth: 16, boxHeight: 2 } },
      tooltip: {
        backgroundColor: cssVar("--color-surface-inverse"),
        titleColor: cssVar("--color-text-inverse"),
        bodyColor: cssVar("--color-text-inverse"),
        callbacks: { title: ([item]) => (item ? dayjs(days[item.dataIndex].date).format("ddd, MMM D, YYYY") : "") },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        border: { color: rule },
        ticks: { color: ink, autoSkip: true, maxTicksLimit: 8, maxRotation: 0 },
      },
      y: {
        beginAtZero: true,
        grid: { color: rule },
        border: { display: false },
        ticks: { color: ink, precision: 0 },
      },
    },
  };

  return (
    <div className={styles.chart}>
      <Line data={data} options={options} role="img" aria-label="Views and clicks by day" />
    </div>
  );
};

export default DailyChart;
