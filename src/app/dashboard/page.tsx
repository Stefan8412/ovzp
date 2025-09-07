"use client";

import { useEffect, useState } from "react";
import { account, databases } from "@/lib/appwrite";
import { Query, ID } from "appwrite";

const DB_ID = "68a583900021d206e9b7";
const USERS_COLLECTION = "68a584f200096452ac1c";
const SYSTEMS_COLLECTION = "68a585d0001d9d6626d9";
const ACCESS_COLLECTION = "68a5863e003d18d713f2";
const ORGS_COLLECTION = "68a583a30003f51d3891";
const RESERVATIONS_COLLECTION = "reservations";
const COMPONENTS_COLLECTION = "components";

export default function DashboardPage() {
  const [profile, setProfile] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [systems, setSystems] = useState<any[]>([]);
  const [accesses, setAccesses] = useState<any[]>([]);
  const [orgs, setOrgs] = useState<any[]>([]);
  const [reservations, setReservations] = useState<any[]>([]);
  const [components, setComponents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const authUser = await account.get();

        const userRes = await databases.listDocuments(DB_ID, USERS_COLLECTION, [
          Query.equal("authUserId", [authUser.$id]),
        ]);

        if (userRes.total === 0) {
          throw new Error("No profile found. Contact your admin.");
        }

        const userProfile = userRes.documents[0];
        setProfile(userProfile);

        // Orgs
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

        // Members
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

        // Accesses
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

        // Systems
        const systemsRes = await databases.listDocuments(
          DB_ID,
          SYSTEMS_COLLECTION
        );
        setSystems(systemsRes.documents);

        // Reservations & Components (admin only)
        if (userProfile.role === "admin") {
          const reservationsRes = await databases.listDocuments(
            DB_ID,
            RESERVATIONS_COLLECTION
          );
          setReservations(reservationsRes.documents);

          const componentsRes = await databases.listDocuments(
            DB_ID,
            COMPONENTS_COLLECTION
          );
          setComponents(componentsRes.documents);
        }
      } catch (err: any) {
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

  // Grant access (responsible role)
  async function grantAccess(userId: string, systemId: string) {
    if (!profile?.organizationId) return;
    try {
      const doc = await databases.createDocument(
        DB_ID,
        ACCESS_COLLECTION,
        ID.unique(),
        {
          userId,
          systemId,
          organizationId: profile.organizationId,
          status: "granted",
          createdAt: new Date().toISOString(),
        }
      );
      setAccesses((prev) => [...prev, doc]);
    } catch (err) {
      console.error("Grant access failed:", err);
    }
  }

  // Cancel access
  async function cancelAccess(accessId: string) {
    try {
      await databases.deleteDocument(DB_ID, ACCESS_COLLECTION, accessId);
      setAccesses((prev) => prev.filter((a) => a.$id !== accessId));
    } catch (err) {
      console.error("Cancel access failed:", err);
    }
  }

  // Build reservation summary (admin only)
  const reservationSummary: Record<string, Record<string, number>> = {};
  reservations.forEach((r) => {
    const orgId = r.organizationId;
    const compId = r.componentId;
    const qty = parseInt(r.quantity, 10) || 0;

    if (!reservationSummary[orgId]) reservationSummary[orgId] = {};
    if (!reservationSummary[orgId][compId])
      reservationSummary[orgId][compId] = 0;

    reservationSummary[orgId][compId] += qty;
  });

  if (loading) {
    return (
      <p className="p-6 text-gray-800 dark:text-gray-200">
        Loading dashboard...
      </p>
    );
  }
  if (error) {
    return <p className="p-6 text-red-600 dark:text-red-400">{error}</p>;
  }

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
        {/* Members (responsible can grant access) */}
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
                    onChange={(e) => {
                      if (e.target.value) {
                        grantAccess(m.$id, e.target.value);
                        e.target.value = "";
                      }
                    }}
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
            {accesses.map((a) => {
              const sys = systems.find((s) => s.$id === a.systemId);
              const user = members.find((u) => u.$id === a.userId);
              return (
                <li
                  key={a.$id}
                  className="p-3 bg-white dark:bg-gray-800 shadow rounded flex justify-between"
                >
                  <span>
                    User: {user?.name || a.userId} → {sys?.name || a.systemId} (
                    {a.status})
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
              );
            })}
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
                {Object.entries(reservationSummary).map(([orgId, compsMap]) => {
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
                        {Object.entries(compsMap).map(([compId, qty]) => {
                          const comp = components.find((c) => c.$id === compId);
                          return (
                            <li key={compId}>
                              {comp?.name || "Unknown Component"}: {qty}
                            </li>
                          );
                        })}
                      </ul>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
