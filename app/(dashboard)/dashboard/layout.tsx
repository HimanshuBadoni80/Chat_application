import GetSession from "@/lib/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
export default async function DashBoardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await GetSession();

  if (!session) {
    const headerList = await headers();
    const currentRoute = headerList.get("x-url") || "/dashboard"; // header from proxy.ts
    redirect(`/login?from=${encodeURIComponent(currentRoute)}&reason=expired`);
  }
  return <>{children}</>;
}
