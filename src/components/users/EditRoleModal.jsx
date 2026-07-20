import { useEffect, useState } from "react";
import Modal from "../common/Modal";
import userService from "../../services/userService";
import toast from "react-hot-toast";

function EditRoleModal({ isOpen, onClose, user, onUpdated }) {
  const [role, setRole] = useState(user?.role || "user");
  const [fullName, setFullName] = useState(user?.full_name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setRole(user?.role || "user");
    setFullName(user?.full_name || "");
    setEmail(user?.email || "");
  }, [user]);

  if (!isOpen || !user) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await userService.updateUserRole(user.id, {
        role,
        full_name: fullName,
        email,
      });
      toast.success("User updated");
      onUpdated?.();
      onClose?.();
    } catch (err) {
      toast.error(err?.message || "Unable to update user");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit user ${user.full_name || user.email}`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Full name
          </label>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="mt-1 w-full rounded-lg border px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">
            Email
          </label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">
            Role
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="mt-1 w-full rounded-lg border px-3 py-2"
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border px-4 py-2"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-blue-600 px-4 py-2 text-white"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default EditRoleModal;
