// decides the layout
import DesktopLayout from "./DesktopLayout";
import MobileLayout from "./MobileLayout";
import { useIsMobile } from "@/hooks/use-mobile";

export default function ResponsiveChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isMobile = useIsMobile();
  
  
  return !isMobile ? (
    <DesktopLayout>{children}</DesktopLayout>
  ) : (
    <MobileLayout>{children}</MobileLayout>
  );
}
