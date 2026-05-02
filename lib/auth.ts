import {
	checkout,
	dodopayments,
	portal,
	webhooks,
} from "@dodopayments/better-auth";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import DodoPayments from "dodopayments";
import prisma from "@/lib/db";

export const dodoPayments = new DodoPayments({
	bearerToken: process.env.DODO_PAYMENTS_API_KEY as string,
	environment: "live_mode",
});

export const auth = betterAuth({
	database: prismaAdapter(prisma, {
		provider: "postgresql",
	}),
	emailAndPassword: {
		enabled: true,
		autoSignIn: true,
	},
	socialProviders: {
		github: {
			clientId: process.env.GITHUB_CLIENT_ID as string,
			clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
		},
		google: {
			clientId: process.env.GOOGLE_CLIENT_ID as string,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
		},
	},
	plugins: [
		dodopayments({
			client: dodoPayments,
			createCustomerOnSignUp: true,
			use: [
				checkout({
					products: [
						{
							productId: process.env.DODO_PAYMENTS_PRODUCT_ID as string,
							slug: "audx_pro",
						},
					],
					successUrl: "/dashboard/success",
					authenticatedUsersOnly: true,
				}),
				portal(),
				webhooks({
					webhookKey: process.env.DODO_PAYMENTS_WEBHOOK_SECRET as string,
					onPayload: async (payload) => {
						console.log("Received webhook:", payload.type);

						if (payload.type === "payment.succeeded") {
							const data = payload.data;

							if (data.payload_type !== "Payment") return;

							const customerId = data.customer.customer_id;
							const paymentId = data.payment_id;
							const status = data.status ?? "succeeded";
							const amount = data.total_amount;
							const currency = data.currency;
							const productId =
								data.product_cart?.[0]?.product_id ??
								(process.env.DODO_PAYMENTS_PRODUCT_ID as string);

							const user = await prisma.user.findFirst({
								where: { dodoCustomerId: customerId },
								select: { id: true },
							});

							if (!user) {
								console.warn(
									`DodoPayments webhook: no user found for customerId ${customerId}`,
								);
								return;
							}

							await prisma.payment.upsert({
								where: { paymentId },
								update: { status, updatedAt: new Date() },
								create: {
									userId: user.id,
									paymentId,
									productId,
									status,
									amount,
									currency,
								},
							});

							console.log(
								`Payment ${paymentId} recorded for user ${user.id} with status ${status}`,
							);
						}

						if (
							payload.type === "payment.failed" ||
							payload.type === "payment.cancelled"
						) {
							const data = payload.data;

							if (data.payload_type !== "Payment") return;

							await prisma.payment.updateMany({
								where: { paymentId: data.payment_id },
								data: {
									status: data.status ?? payload.type.replace("payment.", ""),
								},
							});
						}
					},
				}),
			],
		}),
	],
});
