# Project Structure

```txt
next-chat-app/
├── app/                                  # Next.js App Router
│   ├── layout.tsx                        # Root layout shared by all routes
│   ├── page.tsx                          # Home route: /
│   ├── globals.css                       # Global styles
│   ├── favicon.ico                       # App favicon
│   │
│   ├── actions/
│   │   └── logout.ts                     # Server action for logout
│   │
│   ├── chat/
│   │   ├── layout.tsx                    # Chat section layout
│   │   ├── page.tsx                      # Chat route: /chat
│   │   └── [conversationId]/
│   │       └── page.tsx                  # Dynamic chat route: /chat/:conversationId
│   │
│   ├── (auth)/                           # Auth route group, not included in URL
│   │   ├── login/
│   │   │   ├── page.tsx                  # Login route: /login
│   │   │   └── LoginForm.tsx             # Login form component
│   │   ├── signup/
│   │   │   ├── page.tsx                  # Signup route: /signup
│   │   │   └── SignUpForm.tsx            # Signup form component
│   │   └── verify-email/
│   │       ├── page.tsx                  # Verify email route: /verify-email
│   │       └── components/
│   │           ├── ErrorMessage.tsx
│   │           ├── SuccessMessage.tsx
│   │           ├── VerifyingLoader.tsx
│   │           └── checkInboxView.tsx
│   │
│   └── api/                              # Route handlers
│       ├── auth/
│       │   ├── forgotpassword/
│       │   │   └── route.ts              # /api/auth/forgotpassword
│       │   ├── login/
│       │   │   └── route.ts              # /api/auth/login
│       │   ├── logout/
│       │   │   └── route.ts              # /api/auth/logout
│       │   ├── resend/
│       │   │   └── route.ts              # /api/auth/resend
│       │   ├── reset-password/
│       │   │   └── route.ts              # /api/auth/reset-password
│       │   ├── signup/
│       │   │   └── route.ts              # /api/auth/signup
│       │   └── verify/
│       │       └── route.ts              # /api/auth/verify
│       │
│       ├── conversations/
│       │   ├── conversationList/
│       │   │   └── route.ts              # /api/conversations/conversationList
│       │   └── init/
│       │       └── route.ts              # /api/conversations/init
│       │
│       └── messages/
│           ├── [conversationId]/
│           │   └── route.ts              # /api/messages/:conversationId
│           ├── send/
│           │   └── route.ts              # /api/messages/send
│           └── sync/
│               └── route.ts              # /api/messages/sync
│
├── components/
│   ├── chat/
│   │   ├── ChatConnectionManager.tsx     # Chat socket/connection manager
│   │   ├── Chatlayout.tsx                # Main chat layout component
│   │   ├── sidebar/
│   │   │   ├── ConversationItem.tsx      # Single conversation row
│   │   │   └── ConversationList.tsx      # Conversation sidebar list
│   │   └── window/
│   │       ├── ChatWindow.tsx            # Main message window
│   │       ├── MessageBubble.tsx         # Single message bubble
│   │       ├── MessageInput.tsx          # Message composer
│   │       └── MessageStream.tsx         # Message list/stream
│   │
│   ├── providers/
│   │   └── theme-provider.tsx            # Theme provider
│   │
│   ├── ui/                               # Reusable UI primitives
│   │   ├── button.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── input.tsx
│   │   ├── resizable.tsx
│   │   ├── separator.tsx
│   │   ├── sheet.tsx
│   │   ├── sidebar.tsx
│   │   ├── skeleton.tsx
│   │   └── tooltip.tsx
│   │
│   ├── StoreInitializer.tsx              # Initializes client-side store state
│   └── ThemeToggler.tsx                  # Theme toggle control
│
├── hooks/
│   ├── chat/
│   │   ├── useChatConnection.ts          # Chat connection hook
│   │   └── useChatScroll.ts              # Chat scroll behavior hook
│   └── use-mobile.ts                     # Mobile viewport helper hook
│
├── lib/
│   ├── actions/
│   │   └── mongodb.ts                    # MongoDB connection/action helpers
│   ├── api/
│   │   └── messageApi.ts                 # Message API helpers
│   ├── auth/
│   │   └── logoutService.ts              # Logout service logic
│   ├── error/
│   │   └── errorUtil.ts                  # Error utilities
│   ├── fetchapi/
│   │   └── fetchWrapper.ts               # Fetch wrapper/helper
│   ├── mail/
│   │   └── mail.ts                       # Mail sending logic
│   ├── Models/
│   │   ├── conversation.ts               # Conversation model
│   │   ├── index.ts                      # Model exports
│   │   ├── message.ts                    # Message model
│   │   ├── Session.ts                    # Session model
│   │   ├── stringifyIds.ts               # ObjectId serialization helper
│   │   └── User.ts                       # User model
│   ├── types/
│   │   ├── api.ts                        # API-related types
│   │   └── Conversation.ts               # Conversation-related types
│   ├── zod/
│   │   ├── zodSchemas.ts                 # Shared Zod schemas
│   │   ├── conversation/
│   │   │   └── Schemas.ts                # Conversation schemas
│   │   └── messages/
│   │       └── Schemas.ts                # Message schemas
│   ├── createsession.ts                  # Session creation helper
│   ├── getSession.ts                     # Session lookup helper
│   ├── store.ts                          # App store setup
│   ├── useChatStore.ts                   # Chat state store
│   └── utils.ts                          # Shared utilities
│
├── proxy.ts                              # Next.js proxy/middleware-style logic
├── env.d.ts                              # Environment type declarations
├── next-env.d.ts                         # Next.js TypeScript declarations
├── next.config.ts                        # Next.js config
├── tsconfig.json                         # TypeScript config
├── eslint.config.mjs                     # ESLint config
├── postcss.config.mjs                    # PostCSS config
├── components.json                       # UI component config
├── package.json                          # Project scripts and dependencies
├── package-lock.json                     # Locked dependency versions
├── .env.example                          # Example environment variables
├── .env.local                            # Local environment variables
├── .gitignore                            # Git ignore rules
├── README.md                             # Project notes and documentation
│
├── .next/                                # Generated Next.js build output
├── node_modules/                         # Installed dependencies
└── .git/                                 # Git repository data
```




