import React from 'react';

export type OrderStatus = string;

interface ProgressBarProps {
  current: OrderStatus;
  totalSteps?: number;
  width?: string;
  height?: string;
  bgColor?: string;
  fillColor?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  current,
  totalSteps = 5,
  width = '100%',
  height = '8px',
  bgColor = '#e0e0e0',
  fillColor = '#4caf50',
}) => {
  // current здесь может быть названием статуса, но для визуализации используем порядковый номер
  const numeric = Number(current);
  const step = isNaN(numeric) ? 1 : Math.max(1, Math.min(numeric, totalSteps));
  const percent = (step / Math.max(1, totalSteps)) * 100;

  return (
    <div
      className="progress-bar"
      style={{ width, backgroundColor: bgColor, height, borderRadius: height }}
    >
      <div
        className="progress-bar__fill"
        style={{
          width: `${percent}%`,
          backgroundColor: fillColor,
          height,
          borderRadius: height,
          transition: 'width 0.3s ease',
        }}
      />
    </div>
  );
};
