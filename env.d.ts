// env.d.ts
namespace NodeJS {
  interface ProcessEnv {
    // ---- Public (browser + server) ----
    NEXT_PUBLIC_APP_URL: string;
    NEXT_PUBLIC_WS_URL: string;

    // ---- Server only (never expose to browser) ----
    MONGODB_URL: string;
    RESEND_API_KEY: string;
    NODE_SERVER_URL: string;
    INTERNAL_SECRET: string;
  }
}