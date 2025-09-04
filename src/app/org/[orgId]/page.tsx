"use client";

import { useEffect, useState } from "react";
import { databases, Query } from "@/lib/appwrite";
import { useParams } from "next/navigation";

const DB_ID = "68a583900021d206e9b7";
const USERS_COLLECTION = "68a584f200096452ac1c"; // replace with your actual collection IDs
const SYSTEMS_COLLECTION = "68a585d0001d9d6626d9";
const ACCESS_COLLECTION = "68a5863e003d18d713f2";

export default function OrgAdminPage() {
  const params = useParams();
  const orgId = params.orgId as string;

  const [users, setUsers] = useState<any[]>([]);
  const [systems, setSystems] = useState<any[]>([]);
  const [accesses, setAccesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        // Fetch members of this org
        const usersRes = await databases.listDocuments(
          DB_ID,
          USERS_COLLECTION,
          [Query.equal("organizationId", orgId)]
        );

        // Fetch all systems (shared across orgs)
        const systemsRes = await databases.listDocuments(
          DB_ID,
          SYSTEMS_COLLECTION
        );

        // Fetch access records for this org
        const accessRes = await databases.listDocuments(
          DB_ID,
          ACCESS_COLLECTION,
          [Query.equal("organizationId", orgId)]
        );

        setUsers(usersRes.documents);
        setSystems(systemsRes.documents);
        setAccesses(accessRes.documents);
      } catch (err) {
        console.error("Error loading data:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [orgId]);

  if (loading) return <p>Loading organization {orgId}…</p>;

  return (
    <div>
      <h1>Admin Overview for Organization {orgId}</h1>

      <h2>Members</h2>
      <ul>
        {users.map((u) => (
          <li key={u.$id}>
            {u.name} ({u.email})
            <ul>
              {accesses
                .filter((a) => a.userId === u.$id && a.status === "active")
                .map((a) => {
                  const sys = systems.find((s) => s.$id === a.systemId);
                  return <li key={a.$id}>Access to {sys?.name}</li>;
                })}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}
