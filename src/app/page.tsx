import { requireUser } from "@/auth/session";

export default async function HomePage() {
  const { user } = await requireUser();

  return (
    <main>
      <h1>پول</h1>
      <p>سلام {user.name}. داشبورد به‌زودی اینجا راه می‌افتد.</p>
    </main>
  );
}
