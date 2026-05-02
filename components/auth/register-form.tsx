"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { RiGithubLine, RiGoogleLine } from "@remixicon/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";

const registerSchema = z
	.object({
		name: z.string().min(1, "Name is required"),
		email: z.email("Please enter a valid email address"),
		password: z.string().min(1, "Password is required"),
		confirmPassword: z.string(),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords don't match",
		path: ["confirmPassword"],
	});

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterForm() {
	const router = useRouter();

	const form = useForm<RegisterFormValues>({
		resolver: zodResolver(registerSchema),
		defaultValues: {
			name: "",
			email: "",
			password: "",
			confirmPassword: "",
		},
	});

	const signInGithub = async () => {
		await authClient.signIn.social(
			{
				provider: "github",
			},
			{
				onSuccess: () => {
					router.push("/");
				},
				onError: () => {
					toast.error("Something went wrong");
				},
			},
		);
	};

	const signInGoogle = async () => {
		await authClient.signIn.social(
			{
				provider: "google",
			},
			{
				onSuccess: () => {
					router.push("/");
				},
				onError: () => {
					toast.error("Something went wrong");
				},
			},
		);
	};

	const onSubmit = async (values: RegisterFormValues) => {
		await authClient.signUp.email(
			{
				name: values.name,
				email: values.email,
				password: values.password,
				callbackURL: "/",
			},
			{
				onSuccess: () => {
					router.push("/");
				},
				onError: (ctx) => {
					toast.error(ctx.error.message);
				},
			},
		);
	};

	const isPending = form.formState.isSubmitting;

	return (
		<div className="flex flex-col gap-6">
			<Card>
				<CardHeader className="text-center">
					<CardTitle>Get Started</CardTitle>
					<CardDescription>Create your account to get started</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={form.handleSubmit(onSubmit)}>
						<div className="grid gap-6">
							<div className="flex flex-col gap-4">
								<Button
									onClick={signInGithub}
									variant="outline"
									className="w-full"
									type="button"
									disabled={isPending}
								>
									<RiGithubLine size={20} />
									Continue with GitHub
								</Button>
								<Button
									onClick={signInGoogle}
									variant="outline"
									className="w-full"
									type="button"
									disabled={isPending}
								>
									<RiGoogleLine size={20} />
									Continue with Google
								</Button>
							</div>
							<FieldGroup>
								<Controller
									name="name"
									control={form.control}
									render={({ field, fieldState }) => (
										<Field data-invalid={fieldState.invalid}>
											<FieldLabel htmlFor={field.name}>Name</FieldLabel>
											<Input
												{...field}
												id={field.name}
												type="text"
												placeholder="John Doe"
												aria-invalid={fieldState.invalid}
												autoComplete="name"
											/>
											{fieldState.invalid && (
												<FieldError errors={[fieldState.error]} />
											)}
										</Field>
									)}
								/>
								<Controller
									name="email"
									control={form.control}
									render={({ field, fieldState }) => (
										<Field data-invalid={fieldState.invalid}>
											<FieldLabel htmlFor={field.name}>Email</FieldLabel>
											<Input
												{...field}
												id={field.name}
												type="email"
												placeholder="m@example.com"
												aria-invalid={fieldState.invalid}
											/>
											{fieldState.invalid && (
												<FieldError errors={[fieldState.error]} />
											)}
										</Field>
									)}
								/>
								<Controller
									name="password"
									control={form.control}
									render={({ field, fieldState }) => (
										<Field data-invalid={fieldState.invalid}>
											<FieldLabel htmlFor={field.name}>Password</FieldLabel>
											<Input
												{...field}
												id={field.name}
												type="password"
												placeholder="*********"
												aria-invalid={fieldState.invalid}
											/>
											{fieldState.invalid && (
												<FieldError errors={[fieldState.error]} />
											)}
										</Field>
									)}
								/>
								<Controller
									name="confirmPassword"
									control={form.control}
									render={({ field, fieldState }) => (
										<Field data-invalid={fieldState.invalid}>
											<FieldLabel htmlFor={field.name}>
												Confirm Password
											</FieldLabel>
											<Input
												{...field}
												id={field.name}
												type="password"
												placeholder="*********"
												aria-invalid={fieldState.invalid}
											/>
											{fieldState.invalid && (
												<FieldError errors={[fieldState.error]} />
											)}
										</Field>
									)}
								/>
								<Button type="submit" className="w-full" disabled={isPending}>
									Sign up
								</Button>
							</FieldGroup>
							<div className="text-center text-sm">
								Already have an account?{" "}
								<Link href="/login" className="underline underline-offset-4">
									Login
								</Link>
							</div>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
