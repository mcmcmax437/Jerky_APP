import type { Metadata } from "next";
import { AdminPage } from "@/components/admin/AdminPage";
import { setUserBan } from "@/features/admin/user-actions";
import { listAdminUsers } from "@/features/admin/queries";
import { getSession } from "@/features/auth/session";
import { readLocale } from "@/lib/i18n/request";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { dict } = await readLocale(params);
  return { title: dict.admin.terminal.users };
}

export default async function AdminUsersPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { locale, dict } = await readLocale(params);
  const query = await searchParams;
  const [users, session] = await Promise.all([listAdminUsers(), getSession()]);
  const copy = dict.admin.terminal.user;

  return (
    <AdminPage title={dict.admin.terminal.users} lede={copy.lede}>
      {query.error === "self" ? <p className="text-sm text-chili">{copy.self}</p> : null}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-xs text-[#9c9186]">
            <tr>
              <th className="py-2 pr-4 font-medium">{dict.auth.name}</th>
              <th className="py-2 pr-4 font-medium">{dict.auth.email}</th>
              <th className="py-2 pr-4 font-medium">{copy.role}</th>
              <th className="py-2 pr-4 font-medium">{dict.admin.status}</th>
              <th className="py-2 font-medium">{copy.reason}</th>
            </tr>
          </thead>
          <tbody className="rise-rows">
            {users.map((user) => (
              <tr key={user.id} className="border-t border-white/10 align-top">
                <td className="py-3 pr-4">{user.name}</td>
                <td className="py-3 pr-4">{user.email}</td>
                <td className="py-3 pr-4">{user.role === "ADMIN" ? dict.admin.terminal.role : dict.account.customer}</td>
                <td className="py-3 pr-4">
                  <span className={user.banned ? "text-red-300" : "text-emerald-300"}>{user.banned ? copy.banned : copy.active}</span>
                  {user.banned && user.banReason ? <span className="mt-1 block text-xs text-[#9c9186]">{user.banReason}</span> : null}
                </td>
                <td className="py-3">
                  {session?.id === user.id ? (
                    <span className="text-xs text-[#9c9186]">{copy.self}</span>
                  ) : (
                    <form action={setUserBan} className="flex flex-wrap items-center gap-2">
                      <input type="hidden" name="locale" value={locale} />
                      <input type="hidden" name="id" value={user.id} />
                      <input type="hidden" name="banned" value={user.banned ? "0" : "1"} />
                      {user.banned ? null : (
                        <input
                          name="reason"
                          maxLength={500}
                          placeholder={copy.reasonExample}
                          aria-label={copy.reason}
                          className="w-56 rounded-lg border border-white/10 bg-[#100e0c] px-2 py-2 text-sm placeholder:text-[#8d8278]"
                        />
                      )}
                      <button
                        type="submit"
                        className={`rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] ${
                          user.banned ? "border border-white/15" : "bg-[#e7d3bc] text-[#1a1612]"
                        }`}
                      >
                        {user.banned ? copy.unban : copy.ban}
                      </button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminPage>
  );
}
