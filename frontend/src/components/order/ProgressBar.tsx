import React from 'react';

export type OrderStatus =
  | 'Новый'
  | 'В производстве'
  | 'Готов к отправке'
  | 'Отправлен'
  | 'Завершён';

const STATUSES: OrderStatus[] = [
  'Новый',
  'В производстве',
  'Готов к отправке',
  'Отправлен',
  'Завершён',
];

interface ProgressBarProps {
  current: OrderStatus;
  width?: string;
  height?: string;
  bgColor?: string;
  fillColor?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  current,
  width = '100%',
  height = '8px',
  bgColor = '#e0e0e0',
  fillColor = '#4caf50',
}) => {
  const idx = STATUSES.indexOf(current);
  const percent = ((idx + 1) / STATUSES.length) * 100;

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
