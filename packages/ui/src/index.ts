/* ---------- core primitives ---------- */
export { Button, buttonVariants } from "./components/button";
export { Input, TextInput } from "./components/input";
export { BrandLogo } from "./components/brand-logo";
export { cn } from "./lib/utils";

/* ---------- legacy convenience wrappers ---------- */
export {
  PrimaryButton,
  SecondaryButton,
  GhostButton,
  HighContrastButton,
} from "./components/legacy-buttons";

/* ---------- types ---------- */
export type { BrandLogoProps } from "./components/brand-logo";
export type { ButtonProps } from "./components/legacy-buttons";
