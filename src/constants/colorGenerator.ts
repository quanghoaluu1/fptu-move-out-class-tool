export const textToColor = (text: string): string => {
  const intensity = 120;
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = text.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash;
  }
  let color = "#";
  for (let i = 0; i < 3; i++) {
    let value = (hash >> (i * 8)) & 255;
    // Increase each RGB component to make the color lighter
    value = Math.min(value + intensity, 255); // Add 100 to make it lighter
    color += ("00" + value.toString(16)).slice(-2);
  }
  return color;
};
