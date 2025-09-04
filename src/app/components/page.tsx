"use client";

import { useEffect, useState } from "react";
import { databases } from "@/lib/appwrite";
import { ID, Query } from "appwrite";
import Link from "next/link";
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

  // Collapsible state for reservations summary
  const [openOrgs, setOpenOrgs] = useState<Record<string, boolean>>({});

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

  // Toggle open/close org
  function toggleOrg(orgId: string) {
    setOpenOrgs((prev) => ({ ...prev, [orgId]: !prev[orgId] }));
  }

  if (loading) return <p className="p-6">Loading...</p>;
  if (error) return <p className="p-6 text-red-600">{error}</p>;

  return (
    <div className="p-6 space-y-10 text-gray-900 dark:text-gray-100">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow p-6">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">OVZP - PSK</h1>
          <nav className="flex gap-6">
            <Link
              href="/"
              className="hover:text-blue-600 dark:hover:text-blue-400"
            >
              Home
            </Link>
            <Link
              href="/login"
              className="hover:text-blue-600 dark:hover:text-blue-400"
            >
              Login
            </Link>
            <Link
              href="/components"
              className="hover:text-blue-600 dark:hover:text-blue-400"
            >
              PC komponenty
            </Link>
          </nav>
        </div>
      </header>

      {/* Components list */}
      <div className="grid grid-cols-2 gap-4">
        {components.map((c) => (
          <div
            key={c.$id}
            className="p-4 bg-white dark:bg-gray-800 rounded shadow hover:shadow-lg cursor-pointer"
            onClick={() => setInfoComponent(c)}
          >
            <h2 className="text-lg font-semibold">{c.name}</h2>
            <p>dostupné: {c.available}</p>
          </div>
        ))}
      </div>

      {/* Reservation form */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Rezervuj</h2>
        <form onSubmit={handleReserve} className="space-y-4">
          <div>
            <label className="block text-sm">Organizácia</label>
            <select
              value={selectedOrg}
              onChange={(e) => setSelectedOrg(e.target.value)}
              className="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600"
              required
            >
              <option value="">Zvoľ organizáciu...</option>
              {orgs.map((o) => (
                <option key={o.$id} value={o.$id}>
                  {o.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm">Komponent</label>
            <select
              value={selectedComp}
              onChange={(e) => setSelectedComp(e.target.value)}
              className="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600"
              required
            >
              <option value="">Zvoľ komponent...</option>
              {components.map((c) => (
                <option key={c.$id} value={c.$id}>
                  {c.name} (dostupné: {c.available})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm">Množstvo</label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value, 10))}
              max={
                selectedComp
                  ? components.find((c) => c.$id === selectedComp)?.available ||
                    1
                  : 1
              }
              className="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600"
              required
            />
          </div>

          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Rezervuj
          </button>
        </form>
      </div>

      {/* Reservations summary */}
      <div>
        <h2 className="text-xl font-bold mb-4">Rezervácie</h2>
        {Object.keys(summary).length === 0 ? (
          <p>Zatiaľ žiadne rezervácie.</p>
        ) : (
          <ul className="space-y-4">
            {Object.entries(summary).map(([orgId, comps]) => {
              const org = orgs.find((o) => o.$id === orgId);
              const isOpen = openOrgs[orgId] || false;
              return (
                <li
                  key={orgId}
                  className="p-4 bg-gray-100 dark:bg-gray-700 rounded"
                >
                  <button
                    onClick={() => toggleOrg(orgId)}
                    className="w-full flex justify-between items-center text-left font-semibold"
                  >
                    <span>{org ? org.name : "Unknown Organization"}</span>
                    <span className="text-sm text-blue-500">
                      {isOpen ? "▼" : "▶"}
                    </span>
                  </button>

                  {isOpen && (
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      {Object.entries(comps).map(([compId, qty]) => {
                        const comp = components.find((c) => c.$id === compId);
                        return (
                          <li key={compId}>
                            {comp ? comp.name : "Unknown Component"}: {qty}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Info Modal */}
      {infoComponent && (
        <div className="fixed inset-0 bg-black/50 dark:bg-gray-900/70 flex items-center justify-center z-[9999]">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full relative">
            {/* Close button */}
            <button
              onClick={() => setInfoComponent(null)}
              className="absolute top-3 right-3 text-gray-600 dark:text-gray-300 text-2xl font-bold hover:text-red-600"
            >
              ×
            </button>

            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">
              {infoComponent.name}
            </h2>

            {infoComponent.image && (
              <img
                src={infoComponent.image}
                alt={infoComponent.name}
                className="mb-4 w-full rounded"
              />
            )}

            <p className="font-semibold text-gray-800 dark:text-gray-200">
              Specs:
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1">
              {infoComponent.ram && <li>RAM: {infoComponent.ram}</li>}
              {infoComponent.os && <li>OS: {infoComponent.os}</li>}
              {infoComponent.cpu && <li>CPU: {infoComponent.cpu}</li>}
            </ul>

            <p className="mt-4 text-gray-700 dark:text-gray-300">
              dostupné: {infoComponent.available}
            </p>
          </div>
        </div>
      )}
      <footer className="bg-white dark:bg-gray-800 p-4 text-center mt-10 text-sm text-gray-600 dark:text-gray-400">
        © {new Date().getFullYear()} Rezervacny system. All rights reserved.
      </footer>
    </div>
  );
}
