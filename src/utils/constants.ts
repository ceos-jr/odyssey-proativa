// URL constants
export const PORT = process.env.PORT ?? 3000;
export const LOCAL_HOST = `http://localhost:${PORT}`;
export const VERCEL_URL = process.env.VERCEL_URL;
export const IN_BROWSER = typeof window !== "undefined";
export const IN_DEVELOPMENT = process.env.NODE_ENV === "development";

export enum Roles {
  Admin = "ADMIN",
  Member = "MEMBER",
  Guest = "GUEST",
}

export enum TaskStatus {
  Notsubmitted = "NOTSUBMITTED",
  Submitted = "SUBMITTED",
  Completed = "COMPLETED",
}
