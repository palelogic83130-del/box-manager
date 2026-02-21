export const COLORS = [
    { name: 'Blue', value: '#3498db' },
    { name: 'Red', value: '#e74c3c' },
    { name: 'Green', value: '#2ecc71' },
    { name: 'Orange', value: '#f39c12' },
    { name: 'Purple', value: '#9b59b6' }
];

export const PRINTER_COLORS = [
    { name: '전체', value: 'all' },
    ...COLORS
];

export const CARD_SIZES = {
    landscape: { width: 87, height: 56 },
    portrait: { width: 56, height: 87 }
};

export const DB_NAME = 'BoxManagerDB';
export const DEFAULT_BOX_COLOR = '#3498db';
