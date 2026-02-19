"use client";

import * as React from "react";

import {
  ANIMATION,
  ANIMATION_TIMING,
  FEEDBACK_TIMING,
} from "@saasfly/common";

interface UseFormFocusOptions {
  /** Delay before applying focus styles (ms) */
  delay?: number;
  /** Whether to scroll element into view on focus */
  scrollIntoView?: boolean;
}

interface UseFormFocusReturn {
  /** Ref to attach to the input element */
  ref: React.RefObject<HTMLElement | null>;
  /** Whether the element is currently focused */
  isFocused: boolean;
  /** Handler for focus events */
  onFocus: () => void;
  /** Handler for blur events */
  onBlur: () => void;
}

/**
 * Hook for managing form input focus states with smooth transitions.
 * Provides visual feedback and optional scroll-into-view behavior.
 */
export function useFormFocus(
  options: UseFormFocusOptions = {},
): UseFormFocusReturn {
  const { delay = 0, scrollIntoView = false } = options;
  const ref = React.useRef<HTMLElement>(null);
  const [isFocused, setIsFocused] = React.useState(false);

  const onFocus = React.useCallback(() => {
    setIsFocused(true);

    if (scrollIntoView && ref.current) {
      setTimeout(() => {
        ref.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, delay);
    }
  }, [delay, scrollIntoView]);

  const onBlur = React.useCallback(() => {
    setIsFocused(false);
  }, []);

  React.useEffect(() => {
    const element = ref.current;
    if (!element) return;

    element.addEventListener("focus", onFocus);
    element.addEventListener("blur", onBlur);

    return () => {
      element.removeEventListener("focus", onFocus);
      element.removeEventListener("blur", onBlur);
    };
  }, [onFocus, onBlur]);

  return { ref, isFocused, onFocus, onBlur };
}

interface UseFormSubmissionOptions {
  /** Callback when submission starts */
  onStart?: () => void;
  /** Callback when submission succeeds */
  onSuccess?: () => void;
  /** Callback when submission fails */
  onError?: (error: Error) => void;
  /** Delay before resetting submission state (ms) */
  resetDelay?: number;
}

interface UseFormSubmissionReturn<T> {
  /** Whether form is currently submitting */
  isSubmitting: boolean;
  /** Whether submission was successful */
  isSuccess: boolean;
  /** Error from last submission attempt */
  error: Error | null;
  /** Submit handler wrapper */
  submit: (promise: Promise<T>) => Promise<T | undefined>;
  /** Reset submission state */
  reset: () => void;
}

/**
 * Hook for managing form submission states with loading, success, and error handling.
 * Provides consistent UX patterns across all forms.
 */
export function useFormSubmission<T>(
  options: UseFormSubmissionOptions = {},
): UseFormSubmissionReturn<T> {
  const { onStart, onSuccess, onError, resetDelay = FEEDBACK_TIMING.formReset } = options;

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  const submit = React.useCallback(
    async (promise: Promise<T>): Promise<T | undefined> => {
      setIsSubmitting(true);
      setIsSuccess(false);
      setError(null);
      onStart?.();

      try {
        const result = await promise;
        setIsSuccess(true);
        onSuccess?.();

        setTimeout(() => {
          setIsSuccess(false);
        }, resetDelay);

        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        onError?.(error);
      } finally {
        setIsSubmitting(false);
      }
    },
    [onStart, onSuccess, onError, resetDelay],
  );

  const reset = React.useCallback(() => {
    setIsSubmitting(false);
    setIsSuccess(false);
    setError(null);
  }, []);

  return { isSubmitting, isSuccess, error, submit, reset };
}

interface UseInputValidationOptions {
  /** Validation function */
  validate?: (value: string) => boolean;
  /** Debounce delay for validation (ms) */
  debounceMs?: number;
  /** Whether to validate on blur */
  validateOnBlur?: boolean;
  /** Whether to validate on change */
  validateOnChange?: boolean;
}

interface UseInputValidationReturn {
  /** Whether input value is valid */
  isValid: boolean;
  /** Whether validation has been checked */
  isTouched: boolean;
  /** Handler for input changes */
  onChange: (value: string) => void;
  /** Handler for blur events */
  onBlur: () => void;
  /** Reset validation state */
  reset: () => void;
}

/**
 * Hook for managing input validation with debouncing and touch state.
 * Prevents premature validation errors while typing.
 */
export function useInputValidation(
  options: UseInputValidationOptions = {},
): UseInputValidationReturn {
  const {
    validate,
    debounceMs = ANIMATION_TIMING.debounce,
    validateOnBlur = true,
    validateOnChange = false,
  } = options;

  const [isValid, setIsValid] = React.useState(true);
  const [isTouched, setIsTouched] = React.useState(false);
  const debounceRef = React.useRef<NodeJS.Timeout | null>(null);

  const runValidation = React.useCallback(
    (value: string) => {
      if (!validate) return true;
      return validate(value);
    },
    [validate],
  );

  const onChange = React.useCallback(
    (value: string) => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      if (validateOnChange && isTouched) {
        debounceRef.current = setTimeout(() => {
          setIsValid(runValidation(value));
        }, debounceMs);
      }
    },
    [validateOnChange, isTouched, debounceMs, runValidation],
  );

  const onBlur = React.useCallback(() => {
    setIsTouched(true);
    if (validateOnBlur) {
      // Validation happens via onChange capturing the last value
    }
  }, [validateOnBlur]);

  const reset = React.useCallback(() => {
    setIsValid(true);
    setIsTouched(false);
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
  }, []);

  React.useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return { isValid, isTouched, onChange, onBlur, reset };
}

/**
 * CSS class constants for consistent form styling
 * These eliminate hardcoded Tailwind classes across form components
 */
export const FORM_STYLES = {
  input: {
    base: "flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
    error: "border-red-500 focus-visible:ring-red-500",
    success: "border-green-500 focus-visible:ring-green-500",
  },
  label: {
    base: "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
    required: "after:content-['*'] after:ml-0.5 after:text-red-500",
  },
  error: {
    text: "text-sm text-red-600",
    icon: "h-4 w-4 text-red-500",
  },
  success: {
    text: "text-sm text-green-600",
    icon: "h-4 w-4 text-green-500",
  },
  transition: `${ANIMATION.duration.fast} ${ANIMATION.easing.default}`,
} as const;

/**
 * Focus ring styles for consistent keyboard navigation
 */
export const FOCUS_RING_STYLES = {
  default:
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
  subtle:
    "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
  destructive:
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2",
} as const;
