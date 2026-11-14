import type { Metadata } from "next";
import { AuthLayout } from "@/components/auth/auth-layout";

/** Auth pages: keep them out of search results. */
export const metadata: Metadata = {
	robots: { index: false, follow: true },
};

const Layout = ({ children }: { children: React.ReactNode }) => {
	return <AuthLayout>{children}</AuthLayout>;
};

export default Layout;
