import { NextResponse } from "next/server";
import { auth, dodoPayments } from "@/lib/auth";
import prisma from "@/lib/db";

export async function POST(request: Request) {
	const session = await auth.api.getSession({ headers: request.headers });

	if (!session) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const user = await prisma.user.findUnique({
			where: { id: session.user.id },
			select: { id: true, email: true, name: true, dodoCustomerId: true },
		});

		if (!user) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		const productId = process.env.DODO_PAYMENTS_PRODUCT_ID as string;
		const baseUrl = process.env.BETTER_AUTH_URL || "http://localhost:3000";

		const checkoutSession = await dodoPayments.checkoutSessions.create({
			product_cart: [{ product_id: productId, quantity: 1 }],
			return_url: `${baseUrl}/dashboard/success`,
			...(user.dodoCustomerId
				? {
						customer: {
							customer_id: user.dodoCustomerId,
						},
					}
				: {
						customer: {
							email: user.email,
							name: user.name,
						},
					}),
		});

		return NextResponse.json({ url: checkoutSession.checkout_url });
	} catch (error) {
		console.error("Checkout session creation failed:", error);
		return NextResponse.json(
			{ error: "Failed to create checkout session" },
			{ status: 500 },
		);
	}
}
