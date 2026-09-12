import { useCallback, useEffect, useRef } from "react";

const TYPING_THROTTLE_MS = 2500;
const STOP_DELAY_MS = 3000;

export function useTypingEmitter(
  conversationId: string,
  receiverId: string,
  ws: WebSocket,
  isIdentified: boolean,
) {
  const isTypingRef = useRef(false);
  const lastEmitRef = useRef(0);
  const stopTimerRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const stopTyping = useCallback(() => {
    clearTimeout(stopTimerRef.current);
    isTypingRef.current = false;
    ws.send(
      JSON.stringify({
        type: "TYPING_INDICATOR",
        receiverId,
        conversationId,
        typingStatus: "stop",
      }),
    );
  }, [ws, conversationId, receiverId]);

  const onKeyStroke = useCallback(() => {
    if (!isIdentified) return;

    if (
      !isTypingRef.current ||
      Date.now() - lastEmitRef.current > TYPING_THROTTLE_MS
    ) {
      ws.send(
        JSON.stringify({
          type: "TYPING_INDICATOR",
          receiverId,
          conversationId,
          typingStatus: "start",
        }),
      );
      lastEmitRef.current = Date.now();
      isTypingRef.current = true;
    }

    clearTimeout(stopTimerRef.current);
    stopTimerRef.current = setTimeout(stopTyping, STOP_DELAY_MS);
  }, [ws, stopTyping, conversationId, receiverId, isIdentified]);

  useEffect(() => () => stopTyping(), [stopTyping]);

  return { onKeyStroke, stopTyping };
}
