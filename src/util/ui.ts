export function noteRandomColor(): string {
    const presetColors = ["#FCB02E", "#F57D01", "#E66A19", "#8E243A", "#1F87E8", "#0085B1", "#05A041"];
    return presetColors[Math.floor(Math.random() * presetColors.length)];
}
