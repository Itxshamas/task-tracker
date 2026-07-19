import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import DashboardLayout from "../../components/layout/DashboardLayout";
import Modal from "../../components/common/Modal";
import AssignToUserModal from "../../components/users/AssignToUserModal";
import taskService from "../../services/tasks/taskService";
import useAuth from "../../hooks/useAuth";
import Avatar from "../../components/common/Avatar";

function Users() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      try {
        const data = await taskService.getTeamUsers(user?.id);
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
        taskService.getTeamUsers(user?.id),
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
            <div className="space-y-3">
              {users.map((u) => (
                <div
                  key={u.id}
                  className="flex items-center justify-between rounded-lg border border-slate-100 p-3"
                >
                  <div className="flex items-center gap-3">
                    <Avatar name={u.full_name || u.name || u.email} />
                    <div>
                      <div className="text-sm font-medium text-slate-900">
                        {u.full_name || u.name || u.email}
                      </div>
                      <div className="text-xs text-slate-500">{u.email}</div>
                    </div>
                  </div>

                  <div>
                    <button
                      type="button"
                      onClick={() => openAssignModal(u)}
                      className="rounded-lg border border-violet-200 px-3 py-2 text-sm font-medium text-violet-700 hover:bg-violet-50"
                    >
                      Assign Task
                    </button>
                  </div>
                </div>
              ))}
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
      </div>
    </DashboardLayout>
  );
}

export default Users;
