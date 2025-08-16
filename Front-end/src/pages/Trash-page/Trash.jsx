import React, { useMemo, useState } from "react";
import {
  Trash2,
  RotateCcw,
  Search,
  Filter,
  ChevronDown,
  Calendar,
  X,
  Info,
} from "lucide-react";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";

dayjs.extend(isoWeek);

const MOCK_TRASH = [
  {
    id: "m-101",
    title: "Welcome message to new staff",
    type: "Message",
    module: "Messages",
    deletedBy: "Super Admin",
    deletedAt: dayjs().subtract(0, "day").hour(9).toISOString(),
    reason: "Duplicate",
  },
  {
    id: "c-301",
    title: "Follow-up call with Acme Co.",
    type: "Call",
    module: "Calls",
    deletedBy: "Malu",
    deletedAt: dayjs().subtract(1, "day").hour(11).toISOString(),
    reason: "Wrong contact",
  },
  {
    id: "t-501",
    title: "Prepare monthly report",
    type: "Task",
    module: "Tasks",
    deletedBy: "Sudheesh",
    deletedAt: dayjs().subtract(2, "day").hour(16).toISOString(),
    reason: "Not needed",
  },
  {
    id: "l-201",
    title: "Lead: Rangoni Of Florence",
    type: "Lead",
    module: "Leads",
    deletedBy: "Malu",
    deletedAt: dayjs().subtract(4, "day").toISOString(),
    reason: "Spam",
  },
  {
    id: "a-401",
    title: "Account: Castle Chess Academy",
    type: "Account",
    module: "Accounts",
    deletedBy: "Super Admin",
    deletedAt: dayjs().subtract(11, "day").toISOString(),
    reason: "Merged",
  },
];

const TYPE_OPTIONS = ["All", "Message", "Call", "Task", "Lead", "Account"];
const QUICK_FILTERS = ["All", "Today", "Last 2 Days", "This Week", "Older"];

function ageBucket(iso) {
  const d = dayjs(iso);
  if (d.isSame(dayjs(), "day")) return "Today";
  if (dayjs().diff(d, "day") <= 2) return "Last 2 Days"; // includes yesterday/day-before
  const startOfWeek = dayjs().startOf("week"); // Sunday as start; use isoWeek().startOf("isoWeek") for Mon
  if (d.isAfter(startOfWeek)) return "This Week";
  return "Older";
}

function ageColor(bucket) {
  switch (bucket) {
    case "Today":
      return "bg-red-500 text-red-700/90 ring-red-200";
    case "Last 2 Days":
      return "bg-orange-400 text-orange-700 ring-orange-200";
    case "This Week":
      return "bg-blue-500 text-blue-800 ring-blue-200";
    default:
      return "bg-gray-200 text-gray-700 ring-gray-300";
  }
}

function classNames(...c) {
  return c.filter(Boolean).join(" ");
}

function ConfirmDialog({ open, title, message, confirmText = "Confirm", onConfirm, onClose }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative mx-4 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-3 flex items-start gap-3">
          <div className="mt-1 rounded-full bg-red-50 p-2 text-red-600 ring-1 ring-red-100">
            <Trash2 className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <p className="mt-1 text-sm text-gray-600">{message}</p>
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm?.();
              onClose();
            }}
            className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-red-700"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TrashPage() {
  const [items, setItems] = useState(MOCK_TRASH);
  const [query, setQuery] = useState("");
  const [type, setType] = useState("All");
  const [quick, setQuick] = useState("All");
  const [selected, setSelected] = useState(new Set());
  const [confirm, setConfirm] = useState({ open: false, mode: null, ids: [] });

  const filtered = useMemo(() => {
    let data = [...items];
    if (query.trim()) {
      const q = query.toLowerCase();
      data = data.filter((i) => i.title.toLowerCase().includes(q));
    }
    if (type !== "All") data = data.filter((i) => i.type === type);
    if (quick !== "All") data = data.filter((i) => ageBucket(i.deletedAt) === quick);
    return data;
  }, [items, query, type, quick]);

  const allSelectedOnPage = filtered.length > 0 && filtered.every((i) => selected.has(i.id));

  function toggleSelect(id) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAllOnPage() {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allSelectedOnPage) {
        filtered.forEach((i) => next.delete(i.id));
      } else {
        filtered.forEach((i) => next.add(i.id));
      }
      return next;
    });
  }

  function restore(ids) {
    setItems((prev) => prev.filter((i) => !ids.includes(i.id)));
    setSelected((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.delete(id));
      return next;
    });
  }

  function destroy(ids) {
    setItems((prev) => prev.filter((i) => !ids.includes(i.id)));
    setSelected((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.delete(id));
      return next;
    });
  }

  const selectedCount = selected.size;

  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-6">
      {/* Header */}
      <div className="mb-4 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="rounded-2xl bg-red-600 p-2 text-white shadow-sm">
              <Trash2 className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Trash</h1>
          </div>
          <p className="mt-1 text-sm text-gray-600">
            Items you delete from any page will appear here for 30 days (customize retention in settings).
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search deleted items..."
              className="w-full rounded-xl border border-gray-300 py-2 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 sm:w-80"
            />
          </div>
          <div className="flex gap-2">
            {/* Type Filter */}
            <Dropdown
              label={`Type: ${type}`}
              icon={<Filter className="h-4 w-4" />}
              items={TYPE_OPTIONS}
              onSelect={setType}
            />
          </div>
        </div>
      </div>

      {/* Quick Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {QUICK_FILTERS.map((q) => (
          <button
            key={q}
            onClick={() => setQuick(q)}
            className={classNames(
              "rounded-2xl px-3 py-1.5 text-sm font-medium ring-1",
              quick === q ? "bg-gray-900 text-white ring-gray-900" : "bg-white text-gray-700 ring-gray-300 hover:bg-gray-50"
            )}
          >
            {q}
          </button>
        ))}
        <div className="ml-auto hidden items-center gap-2 sm:flex">
          <span className="text-sm text-gray-500">{filtered.length} item(s)</span>
        </div>
      </div>

      {/* Bulk Action Bar */}
      {selectedCount > 0 && (
        <div className="mb-3 flex items-center justify-between gap-2 rounded-2xl bg-gray-50 p-3 ring-1 ring-gray-200">
          <div className="text-sm text-gray-700">
            <span className="font-semibold">{selectedCount}</span> selected
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setConfirm({ open: true, mode: "restore", ids: Array.from(selected) })}
              className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-700"
            >
              <RotateCcw className="h-4 w-4" /> Restore Selected
            </button>
            <button
              onClick={() => setConfirm({ open: true, mode: "delete", ids: Array.from(selected) })}
              className="inline-flex items-center gap-1 rounded-xl bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow hover:bg-red-700"
            >
              <Trash2 className="h-4 w-4" /> Delete Selected
            </button>
          </div>
        </div>
      )}

      {/* Table (desktop) */}
      <div className="hidden overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm lg:block">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="w-12 px-4 py-3">
                <input type="checkbox" checked={allSelectedOnPage} onChange={toggleSelectAllOnPage} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-400" />
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Item</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Type</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Deleted From</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Deleted By</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Deleted On</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Age</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((i) => {
              const bucket = ageBucket(i.deletedAt);
              return (
                <tr key={i.id} className="hover:bg-gray-50/60">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selected.has(i.id)}
                      onChange={() => toggleSelect(i.id)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-400"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="max-w-xs truncate font-medium text-gray-900">{i.title}</div>
                    {i.reason && <div className="mt-0.5 text-xs text-gray-500">Reason: {i.reason}</div>}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{i.type}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{i.module}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{i.deletedBy}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{dayjs(i.deletedAt).format("DD/MM/YYYY, h:mm A")}</td>
                  <td className="px-4 py-3">
                    <span className={classNames("inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ring-2", ageColor(bucket))}>
                      <span className="h-1.5 w-1.5 rounded-full bg-current" /> {bucket}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setConfirm({ open: true, mode: "restore", ids: [i.id] })}
                        className="inline-flex items-center gap-1 rounded-xl border border-emerald-200 px-3 py-1.5 text-sm font-medium text-emerald-700 hover:bg-emerald-50"
                      >
                        <RotateCcw className="h-4 w-4" /> Restore
                      </button>
                      <button
                        onClick={() => setConfirm({ open: true, mode: "delete", ids: [i.id] })}
                        className="inline-flex items-center gap-1 rounded-xl border border-red-200 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center">
                  <div className="mx-auto max-w-sm">
                    <div className="mx-auto w-fit rounded-2xl bg-gray-100 p-3">
                      <Info className="h-6 w-6 text-gray-500" />
                    </div>
                    <h3 className="mt-3 text-lg font-semibold text-gray-900">No items in Trash</h3>
                    <p className="mt-1 text-sm text-gray-600">Deleted items from all modules will show up here. Try changing filters.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Cards (mobile) */}
      <div className="grid gap-3 lg:hidden">
        {filtered.map((i) => {
          const bucket = ageBucket(i.deletedAt);
          return (
            <div key={i.id} className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-sm font-semibold text-gray-900">{i.title}</div>
                  <div className="mt-0.5 text-xs text-gray-500">{i.type} • {i.module}</div>
                </div>
                <span className={classNames("inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ring-2", ageColor(bucket))}>
                  <span className="h-1.5 w-1.5 rounded-full bg-current" /> {bucket}
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-gray-600">
                <div>By {i.deletedBy}</div>
                <div>{dayjs(i.deletedAt).format("DD/MM/YYYY, h:mm A")}</div>
              </div>
              {i.reason && <div className="mt-1 text-xs text-gray-500">Reason: {i.reason}</div>}
              <div className="mt-3 flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={selected.has(i.id)}
                    onChange={() => toggleSelect(i.id)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-400"
                  />
                  Select
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setConfirm({ open: true, mode: "restore", ids: [i.id] })}
                    className="inline-flex items-center gap-1 rounded-xl border border-emerald-200 px-3 py-1.5 text-sm font-medium text-emerald-700 hover:bg-emerald-50"
                  >
                    <RotateCcw className="h-4 w-4" /> Restore
                  </button>
                  <button
                    onClick={() => setConfirm({ open: true, mode: "delete", ids: [i.id] })}
                    className="inline-flex items-center gap-1 rounded-xl border border-red-200 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" /> Delete
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm">
            <div className="mx-auto w-fit rounded-2xl bg-gray-100 p-3">
              <Info className="h-6 w-6 text-gray-500" />
            </div>
            <h3 className="mt-3 text-lg font-semibold text-gray-900">No items in Trash</h3>
            <p className="mt-1 text-sm text-gray-600">Deleted items from all modules will show up here. Try changing filters.</p>
          </div>
        )}
      </div>

      {/* Footer actions */}
      <div className="mt-6 flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
        <div className="text-xs text-gray-500">Tip: Permanently deleted items cannot be recovered.</div>
        <div className="flex gap-2">
          <button
            onClick={() => setConfirm({ open: true, mode: "restore", ids: filtered.map((i) => i.id) })}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-700"
          >
            <RotateCcw className="h-4 w-4" /> Restore All (Filtered)
          </button>
          <button
            onClick={() => setConfirm({ open: true, mode: "delete", ids: filtered.map((i) => i.id) })}
            className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-red-700"
          >
            <Trash2 className="h-4 w-4" /> Empty Trash (Filtered)
          </button>
        </div>
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirm.open}
        title={confirm.mode === "delete" ? "Permanently delete item(s)?" : "Restore item(s)?"}
        message={
          confirm.mode === "delete"
            ? "This will permanently remove the selected item(s). You cannot undo this action."
            : "Selected item(s) will be restored to their original module."
        }
        confirmText={confirm.mode === "delete" ? "Delete" : "Restore"}
        onConfirm={() => (confirm.mode === "delete" ? destroy(confirm.ids) : restore(confirm.ids))}
        onClose={() => setConfirm({ open: false, mode: null, ids: [] })}
      />
    </div>
  );
}

function Dropdown({ label, items, onSelect, icon }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
      >
        {icon} <span>{label}</span> <ChevronDown className="h-4 w-4 text-gray-400" />
      </button>
      {open && (
        <div className="absolute right-0 z-10 mt-2 w-44 overflow-hidden rounded-xl border border-gray-200 bg-white py-1 shadow-lg">
          {items.map((it) => (
            <button
              key={it}
              onClick={() => {
                onSelect(it);
                setOpen(false);
              }}
              className="block w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
            >
              {it}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
