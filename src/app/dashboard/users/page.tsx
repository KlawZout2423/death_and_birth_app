import DashboardLayout from "@/components/DashboardLayout";

export default function UsersPage() {
  return (
    <DashboardLayout role="admin" userName="Admin">
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">User Management</h1>
          <p className="mt-1 text-zinc-600 dark:text-zinc-400">
            In a production system, this is where the Registrar General creates accounts and assigns roles.
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
          <p className="text-sm text-zinc-700 dark:text-zinc-300">
            Coming soon. Roles currently supported by the backend are:
          </p>
          <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-zinc-700 dark:text-zinc-300">
            <li>REGISTRAR GENERAL (verifies records, issues certificates)</li>
            <li>REGISTRY_OFFICER (registrar: creates birth/death records)</li>
            <li>INSTITUTION_OFFICER (bank/insurance/ssnit notification workflow)</li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
}

