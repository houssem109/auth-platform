export type SystemError = {
  id: string;
  message: string;
  code?: string | null;
  stack?: string | null;
  path?: string | null;
  method?: string | null;
  userEmail?: string | null;
  createdAt: string;
};
