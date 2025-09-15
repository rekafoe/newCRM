import { jsx as _jsx } from "react/jsx-runtime";
const STATUSES = [
    'Новый',
    'В производстве',
    'Готов к отправке',
    'Отправлен',
    'Завершён',
];
export const ProgressBar = ({ current, width = '100%', height = '8px', bgColor = '#e0e0e0', fillColor = '#4caf50', }) => {
    const idx = STATUSES.indexOf(current);
    const percent = ((idx + 1) / STATUSES.length) * 100;
    return (_jsx("div", { className: "progress-bar", style: { width, backgroundColor: bgColor, height, borderRadius: height }, children: _jsx("div", { className: "progress-bar__fill", style: {
                width: `${percent}%`,
                backgroundColor: fillColor,
                height,
                borderRadius: height,
                transition: 'width 0.3s ease',
            } }) }));
};
