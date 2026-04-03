import { Suspense } from "react";
import SupporterSignInClient, {
  SupporterSignInFallback,
} from "./SupporterSignInClient";

export default function SupporterSignInPage() {
  return (
    <Suspense fallback={<SupporterSignInFallback />}>
      <SupporterSignInClient />
    </Suspense>
  );
}
