import DraftChatWindow from "@/components/chat/window/DraftChatWindow";
export default async function DraftConversationPage({
  params,
}: {
  params: Promise<{ contactId: string }>;
}) {
  const { contactId } = await params;
  return <DraftChatWindow contactId={contactId} />;
}
