import React from "react";
import { render, screen } from "@testing-library/react";
import { useForm } from "react-hook-form";
import { describe, expect, it } from "vitest";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./form";

interface TestFormValues {
  name: string;
}

function TestForm({ showError = false }: { showError?: boolean }) {
  const form = useForm<TestFormValues>({
    defaultValues: { name: "" },
  });

  React.useEffect(() => {
    if (showError) {
      form.setError("name", {
        type: "manual",
        message: "Name is required",
      });
    } else {
      form.clearErrors("name");
    }
  }, [form, showError]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(() => {})}>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <input placeholder="Enter your name" {...field} />
              </FormControl>
              <FormDescription>Your display name</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}

describe("Form Component", () => {
  it("should render label, control, and description", () => {
    render(<TestForm />);
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter your name")).toBeInTheDocument();
    expect(screen.getByText("Your display name")).toBeInTheDocument();
  });

  it("should associate the label with the control via htmlFor/id", () => {
    render(<TestForm />);
    const input = screen.getByPlaceholderText("Enter your name");
    const label = screen.getByText("Name");
    expect(label).toHaveAttribute("for", input.id);
  });

  it("should not render a message when there is no error", () => {
    render(<TestForm />);
    expect(screen.queryByText("Name is required")).not.toBeInTheDocument();
  });

  it("should render the error message and mark the control as invalid", async () => {
    render(<TestForm showError />);
    expect(await screen.findByText("Name is required")).toBeInTheDocument();
    const input = screen.getByPlaceholderText("Enter your name");
    expect(input).toHaveAttribute("aria-invalid", "true");
  });

  it("should mark the label as destructive when the field has an error", async () => {
    render(<TestForm showError />);
    await screen.findByText("Name is required");
    expect(screen.getByText("Name")).toHaveClass("text-destructive");
  });

  it("should render children passed to FormMessage when there is no error", () => {
    function MessageForm() {
      const form = useForm<TestFormValues>({
        defaultValues: { name: "" },
      });
      return (
        <Form {...form}>
          <FormField
            control={form.control}
            name="name"
            render={() => (
              <FormItem>
                <FormControl>
                  <input placeholder="Name" />
                </FormControl>
                <FormMessage>Static helper text</FormMessage>
              </FormItem>
            )}
          />
        </Form>
      );
    }
    render(<MessageForm />);
    expect(screen.getByText("Static helper text")).toBeInTheDocument();
  });

  it("should render a message with destructive styling when there is an error", async () => {
    function MessageForm() {
      const form = useForm<TestFormValues>({
        defaultValues: { name: "" },
      });
      React.useEffect(() => {
        form.setError("name", { type: "manual", message: "Too short" });
      }, [form]);
      return (
        <Form {...form}>
          <FormField
            control={form.control}
            name="name"
            render={() => (
              <FormItem>
                <FormControl>
                  <input placeholder="Name" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </Form>
      );
    }
    render(<MessageForm />);
    const message = await screen.findByText("Too short");
    expect(message).toHaveClass("text-destructive");
    expect(message).toHaveClass("text-sm");
  });
});
