"use client";

import { useEffect, useState } from "react";
import { databases } from "@/lib/appwrite";
import { ID, Query } from "appwrite";

const DB_ID = "68a583900021d206e9b7";
const COMPONENTS_COLLECTION = "components";
const RESERVATIONS_COLLECTION = "reservations";
const ORGS_COLLECTION = "68a583a30003f51d3891";

export default function ComponentsPage() {
  const [components, setComponents] = useState<any[]>([]);
  const [reservations, setReservations] = useState<any[]>([]);
  const [orgs, setOrgs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [selectedOrg, setSelectedOrg] = useState("");
  const [selectedComp, setSelectedComp] = useState("");
  const [quantity, setQuantity] = useState(1);

  // Info modal state
  const [infoComponent, setInfoComponent] = useState<any | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [compRes, resRes, orgRes] = await Promise.all([
        databases.listDocuments(DB_ID, COMPONENTS_COLLECTION),
        databases.listDocuments(DB_ID, RESERVATIONS_COLLECTION),
        databases.listDocuments(DB_ID, ORGS_COLLECTION),
      ]);
      setComponents(compRes.documents);
      setReservations(resRes.documents);
      setOrgs(orgRes.documents);
    } catch (err: any) {
      console.error("Error loading components:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleReserve(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedOrg || !selectedComp || quantity <= 0) {
      alert("Select organization, component, and valid quantity");
      return;
    }

    const comp = components.find((c) => c.$id === selectedComp);
    if (!comp) return alert("Component not found");
    if (quantity > comp.available)
      return alert(`Cannot reserve more than available (${comp.available})`);

    try {
      // Create reservation
      await databases.createDocument(
        DB_ID,
        RESERVATIONS_COLLECTION,
        ID.unique(),
        {
          componentId: selectedComp,
          organizationId: selectedOrg,
          quantity,
          reservedBy: "public",
        }
      );

      // Update stock
      await databases.updateDocument(DB_ID, COMPONENTS_COLLECTION, comp.$id, {
        available: comp.available - quantity,
      });

      alert("Reservation successful!");
      setSelectedComp("");
      setSelectedOrg("");
      setQuantity(1);
      await loadData();
    } catch (err: any) {
      console.error("Reservation failed:", err);
      alert("Reservation failed: " + err.message);
    }
  }

  // Summary per organization
  const summary: Record<string, Record<string, number>> = {};
  reservations.forEach((r) => {
    const orgId = r.organizationId;
    const compId = r.componentId;
    const qty = parseInt(r.quantity, 10) || 0;
    if (!summary[orgId]) summary[orgId] = {};
    if (!summary[orgId][compId]) summary[orgId][compId] = 0;
    summary[orgId][compId] += qty;
  });

  if (loading) return <p className="p-6">Loading...</p>;
  if (error) return <p className="p-6 text-red-600">{error}</p>;

  return (
    <div className="p-6 space-y-10">
      <h1 className="text-2xl font-bold">PC Components</h1>

      {/* Components Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {components.map((c) => (
          <div
            key={c.$id}
            className="p-4 bg-white rounded shadow cursor-pointer hover:shadow-lg"
            onClick={() => setInfoComponent(c)}
          >
            <h2 className="text-lg font-semibold">{c.name}</h2>
            <p>Available: {c.available}</p>
          </div>
        ))}
      </div>

      {/* Reservation Form */}
      <div className="bg-white p-6 rounded shadow max-w-md">
        <h2 className="text-xl font-semibold mb-4">Make a Reservation</h2>
        <form onSubmit={handleReserve} className="space-y-4">
          <div>
            <label className="block text-sm">Organization</label>
            <select
              value={selectedOrg}
              onChange={(e) => setSelectedOrg(e.target.value)}
              className="w-full border rounded px-3 py-2"
              required
            >
              <option value="">Select organization...</option>
              {orgs.map((o) => (
                <option key={o.$id} value={o.$id}>
                  {o.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm">Component</label>
            <select
              value={selectedComp}
              onChange={(e) => setSelectedComp(e.target.value)}
              className="w-full border rounded px-3 py-2"
              required
            >
              <option value="">Select component...</option>
              {components.map((c) => (
                <option key={c.$id} value={c.$id}>
                  {c.name} (Available: {c.available})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm">Quantity</label>
            <input
              type="number"
              min={1}
              value={quantity}
              max={
                selectedComp
                  ? components.find((c) => c.$id === selectedComp)?.available ||
                    1
                  : 1
              }
              onChange={(e) => setQuantity(parseInt(e.target.value, 10))}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>

          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Reserve
          </button>
        </form>
      </div>

      {/* Reservation Summary */}
      <div>
        <h2 className="text-xl font-bold mb-4">Reservations Summary</h2>
        {Object.keys(summary).length === 0 ? (
          <p>No reservations yet.</p>
        ) : (
          <ul className="space-y-4">
            {Object.entries(summary).map(([orgId, comps]) => {
              const org = orgs.find((o) => o.$id === orgId);
              return (
                <li key={orgId} className="p-4 bg-gray-100 rounded">
                  <h3 className="font-semibold mb-2">
                    {org ? org.name : "Unknown Organization"}
                  </h3>
                  <ul className="list-disc list-inside">
                    {Object.entries(comps).map(([compId, qty]) => {
                      const comp = components.find((c) => c.$id === compId);
                      return (
                        <li key={compId}>
                          {comp ? comp.name : "Unknown Component"}: {qty}
                        </li>
                      );
                    })}
                  </ul>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Info Modal */}
      {infoComponent && (
        <div
          className="fixed inset-0 bg-white bg-opacity-50 flex items-center justify-center z-[9999]"
          onClick={() => setInfoComponent(null)}
        >
          <div
            className="bg-white p-6 rounded shadow max-w-md w-full relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setInfoComponent(null)}
              className="absolute top-2 right-2 text-red-600 text-3xl font-bold hover:text-red-800 focus:outline-none z-50"
            >
              ×
            </button>
            <h2 className="text-xl font-bold mb-4">{infoComponent.name}</h2>
            {infoComponent.image && (
              <img
                src={infoComponent.image}
                alt={infoComponent.name}
                className="mb-4 w-full rounded"
              />
            )}
            <ul className="list-disc list-inside">
              {infoComponent.ram && <li>RAM: {infoComponent.ram}</li>}
              {infoComponent.os && <li>OS: {infoComponent.os}</li>}
              {infoComponent.cpu && <li>CPU: {infoComponent.cpu}</li>}
            </ul>
            <p className="mt-2">Available: {infoComponent.available}</p>
          </div>
        </div>
      )}
    </div>
  );
}
