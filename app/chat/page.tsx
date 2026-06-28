// this is an empty page, no active conversation. user hasn't clicked a contact yet.
export default function ChatPage() {
    // FUTURE NEW-USER EMPTY STATE:
    // If the user has no conversations yet, this main panel can also render a
    // larger invite to add friends, reusing the sidebar AddFriendsPanel or a
    // focused empty-state variant that points back to that flow.
    return (
        <div className="relative flex h-full w-full flex-col items-center justify-center bg-background/50 p-8 text-center animate-in fade-in duration-500 overflow-hidden">
            {/* Subtle ambient background glow */}
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-[120px]" />
            
            <div className="relative z-10 flex flex-col items-center max-w-sm">
                {/* Empty State Graphic */}
                <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 ring-8 ring-primary/5 animate-in zoom-in duration-700">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                </div>
                
                <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                    Your Messages
                </h2>
                
                <p className="mt-4 text-base text-muted-foreground leading-relaxed">
                    Select an existing conversation from the sidebar or start a new chat to begin messaging.
                </p>

                {/* Optional subtle info badge */}
                <div className="mt-8 rounded-full bg-muted/50 border border-border/50 px-5 py-2.5 text-xs text-muted-foreground font-medium flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    End-to-end encryption coming soon
                </div>
            </div>
        </div>
    );
}