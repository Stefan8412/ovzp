"use client";

import { useEffect, useState } from "react";
import { account, databases } from "@/lib/appwrite";
import { Query, ID } from "appwrite";

const DB_ID = "68a583900021d206e9b7";
const USERS_COLLECTION = "68a584f200096452ac1c";
const SYSTEMS_COLLECTION = "68a585d0001d9d6626d9";
const ACCESS_COLLECTION = "68a5863e003d18d713f2";
const ORGS_COLLECTION = "68a583a30003f51d3891";

export default function DashboardPage() {
  const [profile, setProfile] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [systems, setSystems] = useState<any[]>([]);
  const [accesses, setAccesses] = useState<any[]>([]);
  const [orgs, setOrgs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const authUser = await account.get();

        // 🔎 Find linked user profile
        const userRes = await databases.listDocuments(DB_ID, USERS_COLLECTION, [
          Query.equal("authUserId", [authUser.$id]),
        ]);

        if (userRes.total === 0) {
          throw new Error("No profile found. Contact your admin.");
        }

        const userProfile = userRes.documents[0];
        setProfile(userProfile);

        // Always load systems
        const systemsRes = await databases.listDocuments(
          DB_ID,
          SYSTEMS_COLLECTION
        );
        setSystems(systemsRes.documents);

        if (userProfile.role === "admin") {
          // 👑 Admin: load all organizations, members, and accesses
          const orgsRes = await databases.listDocuments(DB_ID, ORGS_COLLECTION);
          setOrgs(orgsRes.documents);

          const membersRes = await databases.listDocuments(
            DB_ID,
            USERS_COLLECTION
          );
          setMembers(membersRes.documents);

          const accessRes = await databases.listDocuments(
            DB_ID,
            ACCESS_COLLECTION
          );
          setAccesses(accessRes.documents);
        } else {
          // 👤 Responsible (or member): load only their org data
          const membersRes = await databases.listDocuments(
            DB_ID,
            USERS_COLLECTION,
            [Query.equal("organizationId", [userProfile.organizationId])]
          );
          setMembers(membersRes.documents);

          const accessRes = await databases.listDocuments(
            DB_ID,
            ACCESS_COLLECTION,
            [Query.equal("organizationId", [userProfile.organizationId])]
          );
          setAccesses(accessRes.documents);
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

  async function grantAccess(userId: string, systemId: string) {
    if (!profile) return;
    try {
      await databases.createDocument(DB_ID, ACCESS_COLLECTION, ID.unique(), {
        userId,
        systemId,
        organizationId: profile.organizationId,
        status: "granted",
        grantedBy: profile.$id,
        createdAt: new Date().toISOString(),
      });

      alert("Access granted!");
      window.location.reload();
    } catch (err: any) {
      console.error("Error granting access:", err);
      alert("Failed to grant access");
    }
  }

  async function cancelAccess(accessId: string) {
    if (!profile) return;
    try {
      await databases.updateDocument(DB_ID, ACCESS_COLLECTION, accessId, {
        status: "canceled",
        canceledBy: profile.$id,
        updatedAt: new Date().toISOString(),
      });

      alert("Access canceled!");
      window.location.reload();
    } catch (err: any) {
      console.error("Error canceling access:", err);
      alert("Failed to cancel access");
    }
  }

  if (loading) {
    return <p className="p-6">Loading dashboard...</p>;
  }

  if (error) {
    return <p className="p-6 text-red-600">{error}</p>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="flex justify-between items-center bg-white shadow p-4">
        <h1 className="text-xl font-bold">Dashboard</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-600">
            {profile.name} ({profile.role})
          </span>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="p-6">
        {profile.role === "admin" && (
          <>
            <h2 className="text-lg font-semibold mb-4">Organizations</h2>
            <ul className="space-y-2 mb-8">
              {orgs.map((o) => (
                <li
                  key={o.$id}
                  className="p-3 bg-white shadow rounded flex justify-between"
                >
                  <span>{o.name}</span>
                </li>
              ))}
            </ul>
          </>
        )}

        <h2 className="text-lg font-semibold mb-4">Members</h2>
        <ul className="space-y-2 mb-8">
          {members.map((m) => (
            <li
              key={m.$id}
              className="p-3 bg-white shadow rounded flex justify-between"
            >
              <span>
                {m.name} ({m.email})
              </span>
              {profile.role === "responsible" && (
                <select
                  defaultValue=""
                  onChange={(e) => grantAccess(m.$id, e.target.value)}
                  className="border rounded px-2 py-1"
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

        <h2 className="text-lg font-semibold mb-4">Accesses</h2>
        <ul className="space-y-2">
          {accesses.map((a) => (
            <li
              key={a.$id}
              className="p-3 bg-white shadow rounded flex justify-between"
            >
              <span>
                User:{" "}
                {members.find((m) => m.$id === a.userId)?.name || a.userId} →{" "}
                System:{" "}
                {systems.find((s) => s.$id === a.systemId)?.name || a.systemId}{" "}
                ({a.status})
              </span>
              {profile.role === "responsible" && a.status === "granted" && (
                <button
                  onClick={() => cancelAccess(a.$id)}
                  className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
              )}
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
