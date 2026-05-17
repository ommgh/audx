import { ProtectedHeader } from "@/app/(protected)/_componets/protected-header";

export default function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      <ProtectedHeader />
      {children}
    </div>
  );
}
