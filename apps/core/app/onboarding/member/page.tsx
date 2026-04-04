import { Suspense } from "react";
import MemberJoinClient, { MemberJoinFallback } from "./MemberJoinClient";

export const metadata = {
  title: "Join a Circle — Memvella",
};

export default function MemberJoinPage() {
  return (
    <Suspense fallback={<MemberJoinFallback />}>
      <MemberJoinClient />
    </Suspense>
  );
}
