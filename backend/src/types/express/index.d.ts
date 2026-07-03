export interface AuthenticatedUser {
  id: string;
  email: string | undefined;
  role: "customer" | "staff" | "admin" | "super_admin";
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export {};