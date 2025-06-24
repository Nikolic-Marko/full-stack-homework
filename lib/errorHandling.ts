import { ZodError } from "zod";

type ErrorSetter = (error: string | null) => void;

interface ErrorMessages {
  zodError?: string;
  defaultError?: string;
}

export function handleFormError(
  err: unknown,
  setError: ErrorSetter,
  messages: ErrorMessages = {}
): void {
  if (err instanceof ZodError) {
    setError(messages.zodError || "Please enter valid data");
  } else if (err instanceof Error) {
    setError(err.message);
  } else {
    setError(messages.defaultError || "An unexpected error occurred");
  }
}
