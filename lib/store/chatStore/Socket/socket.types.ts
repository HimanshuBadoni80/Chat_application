type socketStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "disconnected"
  | "error";

export interface socketSlice {
  // data
  socket: WebSocket | null;
  status: socketStatus;
  isIdentified: boolean; // Confirms the { type: "IDENTIFY" } worked
  identifyTimeout:ReturnType<typeof setTimeout> | null;
  pongTimeout: ReturnType<typeof setTimeout> | null;
  reconnectTimeout: ReturnType<typeof setTimeout> | null;
  retryCount: number;
  socketError: string | null;
  typingStatuses: Record<string, boolean>;
  typingTimers: Record<string, NodeJS.Timeout>;

  // methods
  connect: (userId: string) => void;
  disconnect: () => void;
  handleIncomingMessage: (data: string, ws: WebSocket) => void;
  // why a separate func
  //the WebSocket onmessage event gives you a "Raw Blob" or a "String." You need a dedicated place to JSON.parse it, check the type (is it a PONG? is it a NEW_MESSAGE?), and then decide which drawer to put it in.
}
