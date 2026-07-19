import { useEffect, useMemo, useState } from "react";

import Modal from "../common/Modal";

function AssignTaskModal({
  isOpen,
  onClose,
  users = [],
  selectedUserId,
  onAssign,
  isAssigning,
}) {
  const [selectedUser, setSelectedUser] = useState(selectedUserId ?? "");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setSelectedUser(selectedUserId ?? "");
    setSearch("");
  }, [isOpen, selectedUserId]);

  const filteredUsers = useMemo(() => {
    const normalized = search.trim().toLowerCase();

    if (!normalized) {
      return users;
    }

    return users.filter((user) => {
      const fullName = String(user.full_name ?? user.name ?? "").toLowerCase();
      const email = String(user.email ?? "").toLowerCase();
      return fullName.includes(normalized) || email.includes(normalized);
    });
  }, [search, users]);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!selectedUser) {
      return;
    }

    onAssign?.(selectedUser);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Assign Task">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-medium text-slate-700">Assigned User</p>
          <p className="mt-1 text-sm text-slate-500">
            Search and select a user from the dropdown.
          </p>
        </div>

        <div className="space-y-3">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name or email"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
            aria-label="Search users"
          />

          <label
            className="text-sm font-medium text-slate-700"
            htmlFor="assigned-user-select"
          >
            Assigned User
          </label>
          <select
            id="assigned-user-select"
            name="assigned-user"
            value={selectedUser}
            onChange={(event) => setSelectedUser(event.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
            aria-label="Select assigned user"
          >
            <option value="">Select a user</option>
            {filteredUsers.map((user) => (
              <option key={user.id} value={user.id}>
                {user.full_name || user.name || user.email} — {user.email}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!selectedUser || isAssigning}
            className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
          >
            {isAssigning ? "Assigning..." : "Assign"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default AssignTaskModal;
