import { interpolate, useCurrentFrame } from "remotion";
import { CompanionScreen, type ScreenProps } from "./CompanionScreen";
import { sceneAt } from "./demo-model";

export type WalkthroughProps = Omit<ScreenProps, "frame" | "compact" | "motion"> & { reducedMotion: boolean };

export function CompanionWalkthrough({ reducedMotion, ...props }: WalkthroughProps) {
  const frame = useCurrentFrame();
  const scene = sceneAt(frame, props.interaction);
  const start = frame >= 570 ? 570 : frame >= 480 ? 480 : frame >= 390 ? 390 : frame >= 240 ? 240 : 60;
  const motion = reducedMotion || props.interaction || !scene ? 1 : interpolate(frame - start, [0, 12], [0.4, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return <CompanionScreen {...props} frame={frame} motion={motion} />;
}
