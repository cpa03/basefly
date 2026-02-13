declare module "tailwindcss/lib/util/flattenColorPalette" {
  function flattenColorPalette(colors: unknown): Record<string, string>;
  export default flattenColorPalette;
}
