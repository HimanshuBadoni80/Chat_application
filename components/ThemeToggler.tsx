// used as standalone theme toggler (like using within a nav bar)


// "use client"

// import { Moon, Sun } from "lucide-react"
// import { useTheme } from "next-themes"

// import { Button } from "@/components/ui/button"
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu"

// export function ModeToggle() {
//   const { setTheme, theme } = useTheme()

//   return (
//     <DropdownMenu>
//       <DropdownMenuTrigger asChild>
//         {/* Modified: Added a teal hover effect and a subtle border 
//             that matches our brand palette.
//         */}
//         <Button 
//           variant="outline" 
//           size="icon" 
//           className="hover:bg-primary-50 hover:text-primary-500 dark:hover:bg-primary-950 dark:hover:text-primary-50 transition-colors"
//         >
//           <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
//           <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
//           <span className="sr-only">Toggle theme</span>
//         </Button>
//       </DropdownMenuTrigger>

//       {/* Modified: Increased padding (spaciousness) and rounded corners 
//           to match our 0.75rem radius.
//       */}
//       <DropdownMenuContent align="end" className="p-2 min-w-32 rounded-xl">
//         <DropdownMenuItem 
//           onClick={() => setTheme("light")}
//           className={`cursor-pointer focus:bg-primary-50 focus:text-primary-500 rounded-lg ${theme === 'light' ? 'bg-primary-50 text-primary-500' : ''}`}
//         >
//           Light
//         </DropdownMenuItem>
//         <DropdownMenuItem 
//           onClick={() => setTheme("dark")}
//           className={`cursor-pointer focus:bg-primary-50 focus:text-primary-500 rounded-lg ${theme === 'dark' ? 'bg-primary-50 text-primary-500' : ''}`}
//         >
//           Dark
//         </DropdownMenuItem>
//         <DropdownMenuItem 
//           onClick={() => setTheme("system")}
//           className={`cursor-pointer focus:bg-primary-50 focus:text-primary-500 rounded-lg ${theme === 'system' ? 'bg-primary-50 text-primary-500' : ''}`}
//         >
//           System
//         </DropdownMenuItem>
//       </DropdownMenuContent>
//     </DropdownMenu>
//   )
// }