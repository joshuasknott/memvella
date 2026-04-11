import { Suspense } from "react";
import OrganiserSignInClient, {
  OrganiserSignInFallback,
} from "./OrganiserSignInClient";

export default function OrganiserSignInPage() {
  return (
    <Suspense fallback={<OrganiserSignInFallback />}>
      <OrganiserSignInClient />
    </Suspense>
  );
}
