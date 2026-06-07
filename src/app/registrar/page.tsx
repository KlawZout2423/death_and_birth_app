import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";

const tiles = [
  {
    href: "/registrar/register-birth",
    title: "Register Birth",
    description: "Submit a new birth record for verification.",
  },
  {
    href: "/registrar/register-death",
    title: "Register Death",
    description: "Submit a new death record for verification.",
  },
  {
    href: "/registrar/my-submissions",
    title: "My Submissions",
    description: "Track statuses of your submitted records.",
  },
];

export default function RegistrarHomePage() {
  return (
    <DashboardLayout role="registrar" userName="Registrar">
      <div className="space-y-8">
        <div>
          <h1 className="mb-2 text-3xl font-bold text-zinc-900 dark:text-zinc-100">Registrar</h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Create new records and follow up on verification outcomes.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {tiles.map((tile) => (
            <Link
              key={tile.href}
              href={tile.href}
              className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-zinc-700 dark:bg-zinc-800"
            >
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">{tile.title}</h2>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{tile.description}</p>
              <div className="mt-5 text-sm font-semibold text-sky-700 dark:text-sky-300">Open →</div>
            </Link>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}

