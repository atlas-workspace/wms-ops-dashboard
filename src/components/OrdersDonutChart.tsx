"use client";

import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { ShipmentProgress } from "@/lib/wms-api";

ChartJS.register(ArcElement, Tooltip, Legend);

interface Props {
  progress: ShipmentProgress | null;
  loading: boolean;
  onSegmentClick?: (status: string) => void;
}

export function OrdersDonutChart({ progress, loading, onSegmentClick }: Props) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="w-32 h-32 rounded-full border-8 border-gray-100 animate-pulse"></div>
      </div>
    );
  }

  if (!progress) {
    return <div className="text-sm text-gray-400 text-center py-8">No order status data available</div>;
  }

  const statuses = ["Shipped", "Picked", "Unpicked", "Uncommitted"];
  const colors = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444"];

  const chartData = {
    labels: statuses,
    datasets: [{
      data: [progress.shippedQty, progress.pickedQty, progress.unpickedQty, progress.uncommitQty],
      backgroundColor: colors,
      borderWidth: 2,
      borderColor: "#ffffff",
      hoverOffset: 4,
    }],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "60%",
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#1a1a2e",
        titleFont: { size: 11 },
        bodyFont: { size: 11 },
        padding: 8,
        cornerRadius: 6,
      },
    },
    onClick: (_event: unknown, elements: Array<{ index: number }>) => {
      if (elements.length > 0 && onSegmentClick) {
        const idx = elements[0].index;
        onSegmentClick(statuses[idx].toLowerCase());
      }
    },
  };

  return (
    <div>
      <div className="h-36 flex items-center justify-center cursor-pointer">
        <Doughnut data={chartData} options={options} />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5">
        {statuses.map((s, i) => (
          <button
            key={s}
            onClick={() => onSegmentClick?.(s.toLowerCase())}
            className="flex items-center gap-1.5 text-xs hover:bg-gray-50 rounded px-1 py-0.5 transition-colors text-left"
          >
            <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: colors[i] }}></div>
            <span className="text-gray-600 truncate">{s}</span>
            <span className="ml-auto font-medium text-gray-800">
              {[progress.shippedQty, progress.pickedQty, progress.unpickedQty, progress.uncommitQty][i]?.toLocaleString() ?? 0}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
