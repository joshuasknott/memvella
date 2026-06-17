import { Suspense } from "react";
import MemberJoinClient, { MemberJoinFallback } from "./MemberJoinClient";

export const metadata = {
  title: "Join a Workspace - Memvella",
};

export default function MemberJoinPage() {
  return (
    <Suspense fallback={<MemberJoinFallback />}>
      <MemberJoinClient />
    </Suspense>
  );
}
