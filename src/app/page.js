"use client";

import { useEffect, useState } from "react";
import { account, databases } from "@/lib/appwrite";
import { Query, ID } from "appwrite";

const DB_ID = "68a583900021d206e9b7";
const USERS_COLLECTION = "68a584f200096452ac1c";
const SYSTEMS_COLLECTION = "68a585d0001d9d6626d9";
const ACCESS_COLLECTION = "68a5863e003d18d713f2";
const ORGS_COLLECTION = "68a583a30003f51d3891";
const RESERVATIONS_COLLECTION = "reservations"; // add your reservations collection ID

export default function DashboardPage() {
  const [profile, setProfile] = useState(null);
  const [members, setMembers] = useState([]);
  const [systems, setSystems] = useState([]);
  const [accesses, setAccesses] = useState([]);
  const [orgs, setOrgs] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const authUser = await account.get();

        const userRes = await databases.listDocuments(DB_ID, USERS_COLLECTION, [
          Query.equal("authUserId", [authUser.$id]),
        ]);

        if (userRes.total === 0)
          throw new Error("No profile found. Contact your admin.");

        const userProfile = userRes.documents[0];
        setProfile(userProfile);

        // Admin: all orgs, Responsible: own org
        const orgFilter =
          userProfile.role === "admin"
            ? undefined
            : [Query.equal("$id", [userProfile.organizationId])];
        const orgsRes = await databases.listDocuments(
          DB_ID,
          ORGS_COLLECTION,
          orgFilter
        );
        setOrgs(orgsRes.documents);

        const membersFilter =
          userProfile.role === "admin"
            ? undefined
            : [Query.equal("organizationId", [userProfile.organizationId])];
        const membersRes = await databases.listDocuments(
          DB_ID,
          USERS_COLLECTION,
          membersFilter
        );
        setMembers(membersRes.documents);

        const accessesFilter =
          userProfile.role === "admin"
            ? undefined
            : [Query.equal("organizationId", [userProfile.organizationId])];
        const accessesRes = await databases.listDocuments(
          DB_ID,
          ACCESS_COLLECTION,
          accessesFilter
        );
        setAccesses(accessesRes.documents);

        const systemsRes = await databases.listDocuments(
          DB_ID,
          SYSTEMS_COLLECTION
        );
        setSystems(systemsRes.documents);

        if (userProfile.role === "admin") {
          const reservationsRes = await databases.listDocuments(
            DB_ID,
            RESERVATIONS_COLLECTION
          );
          setReservations(reservationsRes.documents);
        }
      } catch (err) {
        console.error("Error loading dashboard:", err);
        setError(err.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  async function handleLogout() {
    try {
      await account.deleteSession("current");
      window.location.href = "/login";
    } catch (err) {
      console.error("Logout failed:", err);
    }
  }
  // Build summary
  const reservationSummary = {};
  reservations.forEach((r) => {
    const orgId = r.organizationId;
    const sysId = r.systemId;
    const qty = parseInt(r.quantity, 10) || 0;

    if (!reservationSummary[orgId]) reservationSummary[orgId] = {};
    if (!reservationSummary[orgId][sysId]) reservationSummary[orgId][sysId] = 0;

    reservationSummary[orgId][sysId] += qty;
  });

  if (loading)
    return (
      <p className="p-6 text-gray-800 dark:text-gray-200">
        Loading dashboard...
      </p>
    );
  if (error)
    return <p className="p-6 text-red-600 dark:text-red-400">{error}</p>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Header */}
      <header className="flex justify-between items-center bg-white dark:bg-gray-800 shadow p-4">
        <h1 className="text-xl font-bold">Dashboard</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-600 dark:text-gray-300">
            {profile.name} ({profile.role})
          </span>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="p-6 space-y-8">
        {/* Members */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Members</h2>
          <ul className="space-y-2">
            {members.map((m) => (
              <li
                key={m.$id}
                className="p-3 bg-white dark:bg-gray-800 shadow rounded flex justify-between"
              >
                <span>
                  {m.name} ({m.email})
                </span>
                {profile.role === "responsible" && (
                  <select
                    defaultValue=""
                    onChange={(e) => grantAccess(m.$id, e.target.value)}
                    className="border rounded px-2 py-1 dark:bg-gray-700 dark:text-gray-100"
                  >
                    <option value="">Grant access...</option>
                    {systems.map((s) => (
                      <option key={s.$id} value={s.$id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                )}
              </li>
            ))}
          </ul>
        </section>

        {/* Accesses */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Accesses</h2>
          <ul className="space-y-2">
            {accesses.map((a) => (
              <li
                key={a.$id}
                className="p-3 bg-white dark:bg-gray-800 shadow rounded flex justify-between"
              >
                <span>
                  User: {a.userId} → System: {a.systemId} ({a.status})
                </span>
                {profile.role === "responsible" && a.status === "granted" && (
                  <button
                    onClick={() => cancelAccess(a.$id)}
                    className="bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                )}
              </li>
            ))}
          </ul>
        </section>

        {/* Reservation Summary (admin only) */}
        {profile.role === "admin" && (
          <section>
            <h2 className="text-lg font-semibold mb-4">Reservation Summary</h2>
            {Object.keys(reservationSummary).length === 0 ? (
              <p>No reservations yet.</p>
            ) : (
              <ul className="space-y-4">
                {Object.entries(reservationSummary).map(
                  ([orgId, systemsMap]) => {
                    const org = orgs.find((o) => o.$id === orgId);
                    return (
                      <li
                        key={orgId}
                        className="p-4 bg-gray-100 dark:bg-gray-800 rounded"
                      >
                        <h3 className="font-semibold mb-2">
                          {org?.name || "Unknown Organization"}
                        </h3>
                        <ul className="list-disc list-inside">
                          {Object.entries(systemsMap).map(([sysId, qty]) => {
                            const system = systems.find((s) => s.$id === sysId);
                            const systemName =
                              system?.name ||
                              reservations.find((r) => r.systemId === sysId)
                                ?.systemName ||
                              "Unknown System";
                            return (
                              <li key={sysId}>
                                {systemName}: {qty}
                              </li>
                            );
                          })}
                        </ul>
                      </li>
                    );
                  }
                )}
              </ul>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
