"use client";

import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { ShipmentProgress } from "@/lib/wms-api";

ChartJS.register(ArcElement, Tooltip, Legend);

export function OrdersDonutChart({ progress, loading }: { progress: ShipmentProgress | null; loading: boolean }) {
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

  const chartData = {
    labels: ["Shipped", "Picked", "Unpicked", "Uncommitted"],
    datasets: [
      {
        data: [
          progress.shippedQty,
          progress.pickedQty,
          progress.unpickedQty,
          progress.uncommitQty,
        ],
        backgroundColor: ["#10b981", "#3b82f6", "#f59e0b", "#ef4444"],
        borderWidth: 2,
        borderColor: "#ffffff",
        hoverOffset: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "60%",
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "#1a1a2e",
        titleFont: { size: 11 },
        bodyFont: { size: 11 },
        padding: 8,
        cornerRadius: 6,
      },
    },
  };

  return (
    <div>
      <div className="h-36 flex items-center justify-center">
        <Doughnut data={chartData} options={options} />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5">
        <LegendItem color="#10b981" label="Shipped" value={progress.shippedQty} />
        <LegendItem color="#3b82f6" label="Picked" value={progress.pickedQty} />
        <LegendItem color="#f59e0b" label="Unpicked" value={progress.unpickedQty} />
        <LegendItem color="#ef4444" label="Uncommitted" value={progress.uncommitQty} />
      </div>
    </div>
  );
}

function LegendItem({ color, label, value }: { color: string; label: string; value: number }) {
  return (
    <div className="flex items-center gap-1.5 text-xs">
      <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: color }}></div>
      <span className="text-gray-600 truncate">{label}</span>
      <span className="ml-auto font-medium text-gray-800">{value?.toLocaleString() ?? 0}</span>
    </div>
  );
}
