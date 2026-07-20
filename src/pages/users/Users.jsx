import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import DashboardLayout from "../../components/layout/DashboardLayout";
import Modal from "../../components/common/Modal";
import AssignToUserModal from "../../components/users/AssignToUserModal";
import AddUserModal from "../../components/users/AddUserModal";
import EditRoleModal from "../../components/users/EditRoleModal";
import userService from "../../services/userService";
import taskService from "../../services/tasks/taskService";
import useAuth from "../../hooks/useAuth";
import Avatar from "../../components/common/Avatar";

function Users() {
  const { user, isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editUser, setEditUser] = useState(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      try {
        const data = await taskService.getTeamUsers();
        if (mounted) setUsers(data || []);

        const ownTasks = await taskService.getDashboardTasks(user?.id);
        if (mounted) setTasks(ownTasks || []);
      } catch (err) {
        toast.error(err?.message || "Unable to load users/tasks");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [user?.id]);

  const openAssignModal = (u) => {
    setSelectedUser(u);
    setIsAssignModalOpen(true);
  };

  const handleAssignToUser = async (selectedTaskIds) => {
    if (!selectedTaskIds?.length) return;

    try {
      await Promise.all(
        selectedTaskIds.map((taskId) =>
          taskService.assignTask(taskId, selectedUser.id, user.id),
        ),
      );

      toast.success("Task(s) assigned");
      setIsAssignModalOpen(false);
      setSelectedUser(null);

      // refresh tasks/users
      const [updatedUsers, updatedTasks] = await Promise.all([
        taskService.getTeamUsers(),
        taskService.getDashboardTasks(user?.id),
      ]);

      setUsers(updatedUsers || []);
      setTasks(updatedTasks || []);
    } catch (err) {
      toast.error(err?.message || "Unable to assign tasks");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Users</h2>
            <p className="text-sm text-slate-500">Manage workspace users</p>
          </div>
          {isAdmin && (
            <div>
              <button
                type="button"
                onClick={() => setIsAddUserOpen(true)}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white"
              >
                Add New User
              </button>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-14 animate-pulse rounded bg-slate-100"
                />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="text-left text-sm text-slate-500">
                    <th className="px-3 py-2">User</th>
                    <th className="px-3 py-2">Email</th>
                    <th className="px-3 py-2">Role</th>
                    <th className="px-3 py-2">Created</th>
                    <th className="px-3 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-t border-slate-100">
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar name={u.full_name || u.name || u.email} />
                          <div>
                            <div className="text-sm font-medium text-slate-900">
                              {u.full_name || u.name || u.email}
                            </div>
                            <div className="text-xs text-slate-500">
                              {u.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-sm text-slate-700">
                        {u.email}
                      </td>
                      <td className="px-3 py-3 text-sm text-slate-700">
                        {u.role || "user"}
                      </td>
                      <td className="px-3 py-3 text-sm text-slate-500">
                        {u.created_at
                          ? new Date(u.created_at).toLocaleString()
                          : "-"}
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openAssignModal(u)}
                            className="rounded-lg border border-violet-200 px-3 py-2 text-sm font-medium text-violet-700 hover:bg-violet-50"
                          >
                            Assign Task
                          </button>
                          {isAdmin && (
                            <>
                              <button
                                type="button"
                                onClick={() => setEditUser(u)}
                                className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                disabled={u.id === user?.id}
                                onClick={async () => {
                                  if (u.id === user?.id) return;

                                  const confirmed = window.confirm(
                                    `Delete user "${u.email}"?\n\nThis action cannot be undone.`,
                                  );

                                  if (!confirmed) return;

                                  try {
                                    setLoading(true);

                                    console.group("Delete User");
                                    console.log("User:", u);
                                    console.log("User ID:", u.id);

                                    const result = await userService.deleteUser(
                                      u.id,
                                    );

                                    console.log("Delete Result:", result);
                                    console.groupEnd();

                                    toast.success("User deleted successfully");

                                    const updatedUsers =
                                      await taskService.getTeamUsers();
                                    setUsers(updatedUsers || []);
                                  } catch (err) {
                                    console.group("Delete User Error");
                                    console.error(err);
                                    console.groupEnd();

                                    toast.error(
                                      err?.message ||
                                        err?.error ||
                                        "Unable to delete user",
                                    );
                                  } finally {
                                    setLoading(false);
                                  }
                                }}
                                className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
                              >
                                Delete
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <Modal
          isOpen={isAssignModalOpen}
          onClose={() => setIsAssignModalOpen(false)}
          title={
            selectedUser
              ? `Assign task to ${selectedUser.full_name || selectedUser.email}`
              : "Assign task"
          }
        >
          {selectedUser && (
            <AssignToUserModal
              tasks={tasks}
              onCancel={() => setIsAssignModalOpen(false)}
              onAssign={handleAssignToUser}
            />
          )}
        </Modal>
        <AddUserModal
          isOpen={isAddUserOpen}
          onClose={() => setIsAddUserOpen(false)}
          onCreated={async () => {
            setIsAddUserOpen(false);
            setLoading(true);
            try {
              const data = await taskService.getTeamUsers();
              setUsers(data || []);
            } catch (err) {
              // ignore
            } finally {
              setLoading(false);
            }
          }}
        />
        <EditRoleModal
          isOpen={!!editUser}
          onClose={() => setEditUser(null)}
          user={editUser}
          onUpdated={async () => {
            setEditUser(null);
            setLoading(true);
            try {
              const data = await taskService.getTeamUsers(user?.id);
              setUsers(data || []);
            } catch (err) {
              // ignore
            } finally {
              setLoading(false);
            }
          }}
        />
      </div>
    </DashboardLayout>
  );
}

export default Users;
