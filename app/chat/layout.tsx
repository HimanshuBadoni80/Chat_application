import GetSession from "@/lib/getSession";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import StoreInitializer from "@/components/StoreInitializer";
import type { updatedClientSession } from "@/lib/types/Conversation";
import DesktopLayout from "@/components/screenLayouts/DesktopLayout";
import ChatConnectionManager from "@/components/chat/ChatConnectionManager";
import { Toaster } from "react-hot-toast";
export default async function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headerList = await headers();
  const currentRoute = headerList.get("x-url") || "/chat"; // header from proxy.ts
  let session: updatedClientSession | null;

  try {
    session = await GetSession();
  } catch (error) {
    console.error("Chat session lookup failed:", error);
    return <ChatSessionUnavailable retryHref={currentRoute} />;
  }

  if (!session) {
    // Cookie mutation is not allowed in a Server Component. Redirect through a
    // Route Handler so it can expire the stale browser cookie first.
    redirect(
      `/api/auth/session-expired?from=${encodeURIComponent(currentRoute)}`,
    );
  }

  const username = session.user.username;

  if (!username) {
    redirect("/set-username");
  }

  const user = {
    ...session.user,
    username,
  };

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <StoreInitializer user={user} />
      <ChatConnectionManager />
      <DesktopLayout>{children}</DesktopLayout>
      <Toaster
        position="top-center"
        reverseOrder={false}
        gutter={8}
        containerClassName=""
        containerStyle={{}}
        toasterId="default"
        toastOptions={{
          // Define default options
          className: "",
          duration: 5000,
          removeDelay: 1000,
          style: {
            background: "#363636",
            color: "#fff",
          },

          // Default options for specific types
          success: {
            duration: 3000,
            iconTheme: {
              primary: "green",
              secondary: "black",
            },
          },
        }}
      />
    </div>
  );
}

function ChatSessionUnavailable({ retryHref }: { retryHref: string }) {
  return (
    <main className="flex h-screen w-full items-center justify-center bg-background px-4">
      <section className="w-full max-w-md rounded-lg border border-border bg-card p-6 text-center shadow-sm">
        <h1 className="text-xl font-semibold text-foreground">
          Chat is temporarily unavailable
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          We could not verify your session because the database is not
          responding. Your login was not cleared.
        </p>
        <a
          href={retryHref}
          className="mt-6 inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80"
        >
          Try again
        </a>
      </section>
    </main>
  );
}
