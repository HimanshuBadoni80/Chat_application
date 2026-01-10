export interface ApiResponse<T = void> {
  success: boolean;
  message: string;
  data?: T; // T is the 'payload' (e.g., a User object)
  error?: ApiError;
}

export interface ApiError {
  code: string; // e.g., "USER_EXISTS"
  message: string; // e.g., "This email is already registered"
  //   details?: any;     // Extra debugging info
}
