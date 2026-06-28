import Link from 'next/link';
export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background text-foreground selection:bg-primary/30">
      {/* Ambient background blur/gradient */}
      <div className="absolute top-1/4 left-1/4 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-[100px]" />
      <div className="absolute bottom-1/4 right-1/4 h-96 w-96 translate-x-1/2 translate-y-1/2 rounded-full bg-secondary/20 blur-[100px]" />

      {/* Main Content Container */}
      <div className="relative z-10 flex w-full max-w-5xl flex-col items-center justify-center gap-12 px-6 py-12 text-center md:px-12 md:py-24">
        
        {/* Header Section */}
        <div className="flex flex-col items-center justify-center space-y-6">
          
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent">
            Welcome to <br className="hidden sm:block" />
            <span className="text-primary">NextChat</span>
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground sm:text-xl md:text-2xl">
            Experience seamless, real-time communication with a beautiful and dynamic interface. Built for modern teams and communities.
          </p>
        </div>

        {/* CTA Section */}
        <div className="flex w-full flex-col items-center justify-center gap-4 sm:flex-row mt-4">
          <Link 
            href="/signup" 
            prefetch={true} 
            className="group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-primary px-8 py-4 font-semibold text-primary-foreground shadow-lg transition-transform hover:scale-105 active:scale-95"
          >
            <span className="absolute inset-0 bg-white/20 opacity-0 transition-opacity group-hover:opacity-100"></span>
            Get Started Now
            <svg xmlns="http://www.w3.org/2000/svg" className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Link>
          <Link 
            href="/login" 
            prefetch={true} 
            className="inline-flex items-center justify-center rounded-full border border-border bg-card/50 px-8 py-4 font-semibold text-foreground backdrop-blur-md transition-all hover:bg-accent hover:text-accent-foreground hover:shadow-md active:scale-95"
          >
            Login
          </Link>
        </div>

        {/* Tech Stack Section */}
        <div className="mt-16 w-full max-w-4xl">
          <p className="mb-8 text-sm font-medium uppercase tracking-widest text-muted-foreground">Powered By Modern Tech</p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:gap-6">
            {[
              { name: "Next.js", desc: "React Framework" },
              { name: "Tailwind", desc: "Styling" },
              { name: "Shadcn", desc: "Components" },
              { name: "TypeScript", desc: "Type Safety" },
            ].map((tech) => (
              <div key={tech.name} className="group flex flex-col items-center justify-center rounded-2xl border border-border/50 bg-card/30 p-6 shadow-sm backdrop-blur-sm transition-all hover:border-primary/50 hover:bg-card/60 hover:shadow-md hover:-translate-y-1">
                <span className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">{tech.name}</span>
                <span className="text-xs text-muted-foreground mt-1">{tech.desc}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
