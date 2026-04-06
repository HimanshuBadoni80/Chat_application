import { create } from "zustand";
import { z } from "zod";
import { signUpSchema, emailSchema } from "@/lib/zod/zodSchemas";
import { ApiResponse, UserInfo } from "./types/api";
import apiFetch from "./fetchapi/fetchWrapper";

type FormStatus = "idle" | "submitting" | "error" | "success";

interface FormError {
  email?: string;
  password?: string;
  general?: string;
}

interface SignupState {
  email: string;
  error: FormError | null;
  status: FormStatus;
  resetForm: () => void;
  setEmail: (email: string) => void;
  resetEmail: () => void;
  signUp: (password: string) => Promise<void>;
  resend: (email:string | null) => Promise<ApiResponse<{userEmail:string}>>;
}

export const useSignUpStore = create<SignupState>((set, get) => ({
  email: "",
  error: null,
  status: "idle",
  resetForm: () => set({ error: null, status: "idle" }),
  setEmail: (newEmail) => set({ email: newEmail }),
  resetEmail: () => set({ email: "" }),
  signUp: async function (password) {
    // reset error,status
    set({ error: null, status: "submitting" });

    // do the validation
    const body = {
      userEmail: get().email,
      userPassword: password,
    };
    const validation = signUpSchema.safeParse(body);

    if (!validation.success) {
      // set the status
      const flattened = z.flattenError(validation.error);
      const newErrors: FormError = {
        email: flattened.fieldErrors?.userEmail?.[0],
        password: flattened.fieldErrors?.userPassword?.[0],
        general: flattened.formErrors[0],
      };
      set({ status: "error", error: newErrors });
      return;
    }

    // on validation success, call the api
    try {
      const response = await fetch("api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userEmail: validation.data.userEmail,
          userPassword: validation.data.userPassword,
        }),
      });

      // for not json response
      let responseBody: ApiResponse<UserInfo>;
      // get the content type
      const contentType = response.headers.get("content-type");
      if (contentType && contentType?.includes("application/json")) {
        responseBody = await response.json();
      } else {
        // If it's not JSON (like an HTML error page)
        set({
          status: "error",
          error: { general: "Server error: Please try again later." },
        });
        return;
      }

      if (!response.ok) {
        // set the error obj
        const { error, message } = responseBody;
        const details = (error?.details as Record<string, string>) || {};
        const code = error?.code || "GENERIC_ERROR";
        // use details for specific errors and use code for non-field related error
        const newErrors: FormError = {};

        newErrors.email = details["userEmail"];
        newErrors.password = details["userPassword"];

        if (code === "USER_EXISTS") {
          newErrors.email = "This email is already registered";
        }

        // fallback if details is not present
        if (!newErrors.email && !newErrors.password) {
          newErrors.general = message || "An unexpected error occurred";
        }

        set({ status: "error", error: newErrors });
        return;
      }

      const data = responseBody?.data;
      set({
        status: "success",
        error: null,
        email: data?.userEmail || get().email,
      });
    } catch (error: unknown) {
      const message =
        error instanceof TypeError ? error.message : "unknown error";
      set({ status: "error", error: { general: message } });
    }
  },
  resend: async function (email) {
    const validation = emailSchema.safeParse(get().email || email);
    if (!validation.success) {
      throw new Error("validation error,invalid email format");
    }
    try {
      const responseData = await apiFetch<ApiResponse<{userEmail:string}>>("api/auth/resend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userEmail: validation.data,
        }),
      });
      return responseData;
    } catch (error) {
      throw error;
    }
  },
}));

/* Performance Note: Zustand is "reactive." If Component A uses the email, and Component B calls setEmail, only Component A will re-render. React Context would re-render everything inside the Provider.
 */

/* create builds a small "Store"—a plain JavaScript object that lives in your browser's memory.
 */

/* what zustand do  */
