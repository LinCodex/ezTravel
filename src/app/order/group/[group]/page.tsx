import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CartGroupStatus } from "./CartGroupStatus";

export default async function CartGroupOrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ group: string }>;
  searchParams: Promise<{ email?: string }>;
}) {
  const { group } = await params;
  const { email } = await searchParams;

  return (
    <main className="bg-black min-h-screen flex flex-col">
      <Navbar />
      {email ? (
        <CartGroupStatus cartGroup={group} email={email} />
      ) : (
        <section className="px-5 md:px-10 pt-28 md:pt-32 pb-16 flex-1">
          <p className="text-white/60 text-sm max-w-xl mx-auto">
            Missing email. Open this page from your checkout confirmation link.
          </p>
        </section>
      )}
      <Footer />
    </main>
  );
}
