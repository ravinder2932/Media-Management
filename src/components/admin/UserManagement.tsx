import React, { useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { useAuditStore } from '../../store/useAuditStore';
import { DEFAULT_ROLE_PERMISSIONS } from '../../types/auth';
import type { Role, UserPermissions } from '../../types/auth';

interface PasswordUpdateModalProps {
  userId: string;
  userName: string;
  onClose: () => void;
  onUpdate: (password: string) => Promise<void>;
}

function PasswordUpdateModal({ userId, userName, onClose, onUpdate }: PasswordUpdateModalProps) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    try {
      setIsUpdating(true);
      await onUpdate(newPassword);
      onClose();
    } catch (err) {
      setError('Failed to update password');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-medium mb-4">Update Password for {userName}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
              minLength={6}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
              minLength={6}
            />
          </div>
          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              disabled={isUpdating}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
              disabled={isUpdating}
            >
              {isUpdating ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function UserManagement() {
  const { users, createUser, deleteUser, updateUserPermissions, updateUserRole, updateUserPassword, currentUser } = useAuthStore();
  const addLog = useAuditStore(state => state.addLog);
  
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    name: '',
    role: 'viewer' as Role,
  });

  const [selectedUserForPassword, setSelectedUserForPassword] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    await createUser(newUser);
    addLog({
      action: 'create_user',
      userId: currentUser!.id,
      details: `Created user ${newUser.email}`,
    });
    setNewUser({
      email: '',
      password: '',
      name: '',
      role: 'viewer',
    });
  };

  const handlePasswordUpdate = async (newPassword: string) => {
    if (!selectedUserForPassword) return;

    await updateUserPassword(selectedUserForPassword.id, newPassword);
    addLog({
      action: 'update_user',
      userId: currentUser!.id,
      targetId: selectedUserForPassword.id,
      details: 'Updated user password',
    });
  };

  const handleRoleChange = async (userId: string, newRole: Role) => {
    await updateUserRole(userId, newRole);
    addLog({
      action: 'update_user',
      userId: currentUser!.id,
      targetId: userId,
      details: `Updated user role to ${newRole}`,
    });
  };

  const handleDeleteUser = async (userId: string, userEmail: string) => {
    await deleteUser(userId);
    addLog({
      action: 'delete_user',
      userId: currentUser!.id,
      targetId: userId,
      details: `Deleted user ${userEmail}`,
    });
  };

  const handlePermissionChange = async (
    userId: string,
    permission: keyof UserPermissions,
    value: boolean
  ) => {
    await updateUserPermissions(userId, { [permission]: value });
    addLog({
      action: 'update_user',
      userId: currentUser!.id,
      targetId: userId,
      details: `Updated ${permission} permission to ${value}`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium mb-4">Create New User</h2>
        <form onSubmit={handleCreateUser} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              required
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              required
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Role</label>
            <select
              value={newUser.role}
              onChange={(e) => {
                const role = e.target.value as Role;
                setNewUser({ ...newUser, role });
              }}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="viewer">Viewer</option>
              <option value="editor">Editor</option>
              <option value="admin">Admin</option>
              {currentUser?.role === 'super_admin' && (
                <option value="super_admin">Super Admin</option>
              )}
            </select>
          </div>
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Create User
          </button>
        </form>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium mb-4">Manage Users</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Permissions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {currentUser?.role === 'super_admin' ? (
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value as Role)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      >
                        <option value="viewer">Viewer</option>
                        <option value="editor">Editor</option>
                        <option value="admin">Admin</option>
                        <option value="super_admin">Super Admin</option>
                      </select>
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 capitalize">
                        {user.role}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {currentUser?.role === 'super_admin' && (
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(user.permissions).map(([key, value]) => (
                          <label key={key} className="inline-flex items-center">
                            <input
                              type="checkbox"
                              checked={value}
                              onChange={(e) => handlePermissionChange(
                                user.id,
                                key as keyof UserPermissions,
                                e.target.checked
                              )}
                              className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                            <span className="ml-2 text-sm text-gray-700 capitalize">{key.replace('_', ' ')}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-4">
                      {currentUser?.role === 'super_admin' && (
                        <>
                          <button
                            onClick={() => setSelectedUserForPassword({ id: user.id, name: user.name })}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Update Password
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id, user.email)}
                            className="text-red-600 hover:text-red-900"
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
      </div>

      {selectedUserForPassword && (
        <PasswordUpdateModal
          userId={selectedUserForPassword.id}
          userName={selectedUserForPassword.name}
          onClose={() => setSelectedUserForPassword(null)}
          onUpdate={handlePasswordUpdate}
        />
      )}
    </div>
  );
}