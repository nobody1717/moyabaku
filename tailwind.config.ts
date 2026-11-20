import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0A0A0A",
        graphite: "#121212",
        raised: "#181818",
        line: "rgba(255,255,255,0.11)",
        bone: "#ECE8E1",
        mute: "#9A968F",
        ok: "#8FB59B",
        warn: "#C9A66B",
        danger: "#D98B7C",
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
