import { library } from "@memvella/config-eslint/library";

export default library({
  ignores: ["convex/_generated/**"],
  rules: {
    "@typescript-eslint/no-explicit-any": "off",
  },
});
