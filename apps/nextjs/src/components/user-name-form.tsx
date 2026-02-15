"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type * as z from "zod";

import type { User } from "@saasfly/auth";
import { cn } from "@saasfly/ui";
import { Button } from "@saasfly/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@saasfly/ui/card";
import { Input } from "@saasfly/ui/input";
import { Label } from "@saasfly/ui/label";
import { toast } from "@saasfly/ui/use-toast";

import { useFormErrorScroll } from "~/hooks/use-form-error-scroll";
import { userNameSchema } from "~/lib/validations/user";
import { trpc } from "~/trpc/client";

interface UserNameFormProps extends React.HTMLAttributes<HTMLFormElement> {
  user: Pick<User, "id" | "name">;
}

type FormData = z.infer<typeof userNameSchema>;

export function UserNameForm({ user, className, ...props }: UserNameFormProps) {
  const router = useRouter();
  const scrollToError = useFormErrorScroll();
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(userNameSchema),
    defaultValues: {
      name: user?.name ?? "",
    },
  });
  const [isSaving, setIsSaving] = React.useState<boolean>(false);

  React.useEffect(() => {
    scrollToError(errors);
  }, [errors, scrollToError]);

  async function onSubmit(data: FormData) {
    setIsSaving(true);

    const response = await trpc.customer.updateUserName.mutate({
      name: data.name,
      userId: user.id,
    });
    setIsSaving(false);

    if (!response?.success) {
      return toast({
        title: "Something went wrong.",
        description: "Your name was not updated. Please try again.",
        variant: "destructive",
      });
    }

    toast({
      description: "Your name has been updated.",
    });

    router.refresh();
  }

  return (
    <form
      className={cn(className)}
      onSubmit={handleSubmit(onSubmit)}
      {...props}
    >
      <Card>
        <CardHeader>
          <CardTitle>Your Name</CardTitle>
          <CardDescription>
            Please enter your full name or a display name you are comfortable
            with.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-1">
            <Label className="sr-only" htmlFor="name">
              Name
            </Label>
            <Input
              id="name"
              className="w-full max-w-[400px]"
              size={32}
              aria-invalid={!!errors?.name}
              aria-describedby={errors?.name ? "name-error" : undefined}
              {...register("name")}
            />
            {errors?.name && (
              <p
                id="name-error"
                className="px-1 text-xs text-red-600"
                role="alert"
              >
                {errors.name.message}
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" isLoading={isSaving}>
            Save
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
