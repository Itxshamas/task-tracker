import { useState } from "react";
import Modal from "../common/Modal";
import userService from "../../services/userService";
import toast from "react-hot-toast";

function AddUserModal({ isOpen, onClose, onCreated }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!name.trim()) errors.name = "Full name is required";
    if (!email.trim()) errors.email = "Email is required";
    if (!password) errors.password = "Password is required";

    if (Object.keys(errors).length) {
      Object.values(errors).forEach((m) => toast.error(m));
      return;
    }

    setIsSaving(true);

    try {
      const result = await userService.createUserAsAdmin({
        full_name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      });

      toast.success("User created");
      onCreated?.(result);
      onClose?.();
    } catch (err) {
      toast.error(err?.message || "Unable to create user");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New User">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Full Name
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
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
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border px-3 py-2"
          />
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
            disabled={isSaving}
            className="rounded-lg bg-blue-600 px-4 py-2 text-white"
          >
            {isSaving ? "Creating..." : "Create User"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default AddUserModal;
