export type AuthUser = {
  _id: string;
  uid: string;
  username: string;
  email: string;
  isVerified: boolean;
};

export interface AuthSlice {
  user: AuthUser | null;
  setAuth: (user: AuthUser) => void;
  clearAuth: () => void;
  
}
