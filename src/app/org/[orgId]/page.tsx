"use client";
import { useEffect, useState } from "react";
import { databases, Query } from "@/app/lib/appwrite";

const DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DB!;
const USERS_COLLECTION = "users";
const SYSTEMS_COLLECTION = "systems";
const ACCESS_COLLECTION = "access";

export default function OrgDashboard({
  params,
}: {
  params: { orgId: string };
}) {
  const { orgId } = params;
  const [users, setUsers] = useState<any[]>([]);
  const [systems, setSystems] = useState<any[]>([]);
  const [access, setAccess] = useState<any[]>([]);

  // fetch org data
  useEffect(() => {
    async function loadData() {
      const usersRes = await databases.listDocuments(DB_ID, USERS_COLLECTION, [
        Query.equal("organizationId", orgId),
      ]);
      const systemsRes = await databases.listDocuments(
        DB_ID,
        SYSTEMS_COLLECTION
      );
      const accessRes = await databases.listDocuments(
        DB_ID,
        ACCESS_COLLECTION,
        [Query.equal("organizationId", orgId)]
      );

      setUsers(usersRes.documents);
      setSystems(systemsRes.documents);
      setAccess(accessRes.documents);
    }
    loadData();
  }, [orgId]);

  async function grantAccess(
    userId: string,
    systemId: string,
    grantedBy: string
  ) {
    await databases.createDocument(DB_ID, ACCESS_COLLECTION, "unique()", {
      userId,
      systemId,
      organizationId: orgId,
      status: "granted",
      grantedBy,
    });
    location.reload();
  }

  async function cancelAccess(accessId: string, canceledBy: string) {
    await databases.updateDocument(DB_ID, ACCESS_COLLECTION, accessId, {
      status: "canceled",
      canceledBy,
    });
    location.reload();
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Organization Dashboard</h1>

      {users.map((user) => (
        <div key={user.$id} className="mb-4 p-4 border rounded">
          <h2 className="text-lg font-semibold">{user.name}</h2>
          <p>Email: {user.email}</p>

          <h3 className="mt-2 font-medium">System Access:</h3>
          <ul>
            {access
              .filter((a) => a.userId === user.$id && a.status !== "canceled")
              .map((a) => {
                const sys = systems.find((s) => s.$id === a.systemId);
                return (
                  <li key={a.$id} className="flex items-center justify-between">
                    {sys?.name} ({a.status})
                    <button
                      onClick={() => cancelAccess(a.$id, "responsible-user-id")}
                      className="ml-2 px-2 py-1 bg-red-500 text-white rounded"
                    >
                      Cancel
                    </button>
                  </li>
                );
              })}
          </ul>

          <h3 className="mt-2 font-medium">Grant New Access:</h3>
          <select
            onChange={(e) =>
              grantAccess(user.$id, e.target.value, "responsible-user-id")
            }
            defaultValue=""
          >
            <option value="">Select System</option>
            {systems.map((s) => (
              <option key={s.$id} value={s.$id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );
}
