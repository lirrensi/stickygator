export function roundToNearestTen(number) {
    return Math.ceil(number / 10) * 10;
}

export const MAX_Z_INDEX_CALC = 100000;
export function timestampToZIndex(timestamp: number, minTimestamp: number, maxTimestamp: number): number {
    console.log("timestampToZIndex", arguments);

    if (minTimestamp >= maxTimestamp) return MAX_Z_INDEX_CALC;

    if (timestamp < minTimestamp) timestamp = minTimestamp;
    if (timestamp > maxTimestamp) timestamp = maxTimestamp;

    const rangeTimestamp = maxTimestamp - minTimestamp;
    const normalized = (timestamp - minTimestamp) / rangeTimestamp;

    return Math.round(normalized * MAX_Z_INDEX_CALC);
}
