// "use client";

// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import apiFetch from "@/lib/fetchapi/fetchWrapper";
// import { ApiResponse, isApiResponse } from "@/lib/types/api";
// import { usernameSchema } from "@/lib/zod/zodSchemas";
// import {  AtSign } from "lucide-react";
// import { useRouter } from "next/navigation";
// import { useState } from "react";
// import toast from "react-hot-toast";
// import { z } from "zod";

// export default function SetUsernamePage() {
//   const router = useRouter();
//   const [username, setUsername] = useState("");
//   const [error, setError] = useState<Record<string, string>>({});
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
//     event.preventDefault();
//     setError({});

//     const validation = usernameSchema.safeParse({ username });
//     if (!validation.success) {
//       const flattened = z.flattenError(validation.error);
//       setError(
//         Object.fromEntries(
//           Object.entries(flattened.fieldErrors).map(([key, value]) => [
//             key,
//             value?.[0] || "Invalid",
//           ]),
//         ),
//       );
//       return;
//     }

//     setIsSubmitting(true);

//     try {
//       const result = await apiFetch<
//         ApiResponse<{ username: string; redirectTo: string }>
//       >("/api/users/username", {
//         method: "PATCH",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(validation.data),
//       });

//       if (result.success && result.data) {
//         toast.success("Username saved");
//         router.replace(result.data.redirectTo);
//         router.refresh();
//       }
//     } catch (error) {
//       if (isApiResponse(error) && error.error) {
//         if (error.error.code === "VALIDATION_ERROR") {
//           setError(error.error.details || { general: error.message });
//           return;
//         }

//         if (error.error.code === "USER_EXISTS") {
//           setError(error.error.details || { username: error.message });
//           return;
//         }
//       }

//       setError({
//         general:
//           error instanceof Error
//             ? error.message
//             : "Could not save username. Please try again.",
//       });
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <main className="flex min-h-screen w-full items-center justify-center bg-background px-4 py-8">
//       <form
//         onSubmit={handleSubmit}
//         className="w-full max-w-sm rounded-lg border border-border bg-card p-6 shadow-sm"
//       >
//         <div className="mb-6">
//           <div className="mb-4 flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary">
//             <AtSign className="size-5" />
//           </div>
//           <h1 className="text-2xl font-semibold tracking-tight text-foreground">
//             Choose a username
//           </h1>
//           <p className="mt-2 text-sm leading-6 text-muted-foreground">
//             This name will be shown in chats and can contain letters, numbers,
//             spaces, or underscores.
//           </p>
//         </div>

//         <div className="space-y-2">
//           <label
//             htmlFor="username"
//             className="text-sm font-medium text-foreground"
//           >
//             Username
//           </label>
//           <Input
//             id="username"
//             name="username"
//             autoComplete="username"
//             autoFocus
//             required
//             minLength={3}
//             maxLength={20}
//             value={username}
//             onChange={(event) => setUsername(event.target.value)}
//             placeholder="your_name"
//             aria-invalid={Boolean(error.username)}
//           />
//           {error.username && (
//             <p className="text-sm text-destructive">{error.username}</p>
//           )}
//         </div>

//         {error.general && (
//           <div className="mt-4 rounded-md border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
//             {error.general}
//           </div>
//         )}

//         <Button
//           type="submit"
//           size="lg"
//           className="mt-6 w-full"
//           disabled={isSubmitting}
//         >
//           {isSubmitting ? "saving..." : "save"}
          
//         </Button>
//       </form>
//     </main>
//   );
// }
