import { useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import './Users.css';

type Role = {
  id: number;
  name: string;
  description?: string;
};

type UserRole = {
  id: number;
  role: Role;
};

type User = {
  id: number;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  userRoles?: UserRole[];
};

const ROLE_NAMES = [
  'SUPER_ADMIN',
  'DIRECTOR',
  'DIVISION_HEAD',
  'HR_MANAGER',
  'SALES_MANAGER',
  'SALES_EXECUTIVE',
  'FINANCE_MANAGER',
  'PROJECT_MANAGER',
  'EMPLOYEE',
  'CONTENT_MANAGER',
  'VIEWER',
];

const formatDate = (date: string) => {
  if (!date) return '-';

  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [search, setSearch] = useState('');

  const [loading, setLoading] = useState(true);
  const [savingUserId, setSavingUserId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await api.get<User[]>('/users');

      const usersWithRoles = await Promise.all(
        response.data.map(async (user) => {
          try {
            const roleResponse = await api.get<UserRole[]>(
              `/users/${user.id}/roles`,
            );

            return {
              ...user,
              userRoles: roleResponse.data,
            };
          } catch {
            return {
              ...user,
              userRoles: [],
            };
          }
        }),
      );

      setUsers(usersWithRoles);
    } catch (err: any) {
      console.error(err);

      setError(
        err?.response?.data?.message ||
          'Failed to load users.',
      );
    } finally {
      setLoading(false);
    }
  };

  const loadRoles = async () => {
    try {
      const response = await api.get<Role[]>('/roles');

      setRoles(response.data);
    } catch (err) {
      console.error('Failed to load roles:', err);

      /*
       * Fallback keeps the UI usable if the backend does not
       * expose GET /roles in the current environment.
       */
      setRoles(
        ROLE_NAMES.map((name, index) => ({
          id: index + 1,
          name,
        })),
      );
    }
  };

  useEffect(() => {
    loadUsers();
    loadRoles();
  }, []);

  const handleRoleChange = async (
    user: User,
    newRoleId: number,
  ) => {
    if (!newRoleId) return;

    try {
      setSavingUserId(user.id);
      setError('');
      setSuccess('');

      const currentRoles = user.userRoles || [];

      /*
       * Remove existing roles first.
       * This keeps the normal Users & Roles screen as a
       * single-primary-role management interface.
       */
      for (const userRole of currentRoles) {
        if (userRole.role.id !== newRoleId) {
          await api.delete(
            `/users/${user.id}/roles/${userRole.role.id}`,
          );
        }
      }

      const alreadyHasRole = currentRoles.some(
        (userRole) => userRole.role.id === newRoleId,
      );

      if (!alreadyHasRole) {
        await api.post(`/users/${user.id}/roles`, {
          roleId: newRoleId,
        });
      }

      await loadUsers();

      setSuccess(
        `Role updated successfully for ${user.name}.`,
      );
    } catch (err: any) {
      console.error(err);

      setError(
        err?.response?.data?.message ||
          'Failed to update the user role.',
      );
    } finally {
      setSavingUserId(null);
    }
  };

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return users;

    return users.filter((user) => {
      const roleText =
        user.userRoles
          ?.map((userRole) => userRole.role.name)
          .join(' ') || '';

      return (
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        roleText.toLowerCase().includes(query)
      );
    });
  }, [users, search]);

  const rolesInUse = new Set(
    users.flatMap(
      (user) =>
        user.userRoles?.map(
          (userRole) => userRole.role.name,
        ) || [],
    ),
  ).size;

  return (
    <div className="users-page">
      <div className="users-header">
        <div>
          <h1>Users & Roles</h1>
          <p>
            Manage ERP users, roles and access control.
          </p>
        </div>

        <button
          className="users-refresh"
          onClick={loadUsers}
          disabled={loading}
        >
          ↻ Refresh
        </button>
      </div>

      <div className="users-summary">
        <div className="users-card">
          <span>Total Users</span>
          <strong>{users.length}</strong>
        </div>

        <div className="users-card">
          <span>Roles In Use</span>
          <strong>{rolesInUse}</strong>
        </div>

        <div className="users-card">
          <span>Available Roles</span>
          <strong>{roles.length || ROLE_NAMES.length}</strong>
        </div>
      </div>

      {success && (
        <div className="users-success">
          ✓ {success}
        </div>
      )}

      {error && (
        <div className="users-error">
          {error}
        </div>
      )}

      <div className="users-toolbar">
        <input
          type="text"
          placeholder="Search by name, email or role..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <span className="users-count">
          Showing {filteredUsers.length} of {users.length}
        </span>
      </div>

      {loading ? (
        <div className="users-state">
          Loading users and roles...
        </div>
      ) : (
        <div className="users-table-wrapper">
          <table className="users-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>User</th>
                <th>Email</th>
                <th>Current Role</th>
                <th>Change Role</th>
                <th>Created</th>
                <th>Updated</th>
              </tr>
            </thead>

            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="users-empty"
                  >
                    {search
                      ? 'No users match your search.'
                      : 'No users found.'}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const currentRole =
                    user.userRoles?.[0]?.role;

                  const selectedRoleId =
                    currentRole?.id || '';

                  return (
                    <tr key={user.id}>
                      <td className="user-id">
                        #{user.id}
                      </td>

                      <td>
                        <div className="user-name">
                          <div className="user-avatar">
                            {user.name
                              ?.charAt(0)
                              .toUpperCase() || '?'}
                          </div>

                          <strong>{user.name}</strong>
                        </div>
                      </td>

                      <td className="user-email">
                        {user.email}
                      </td>

                      <td>
                        <div className="user-role-list">
                          {user.userRoles &&
                          user.userRoles.length > 0 ? (
                            user.userRoles.map(
                              (userRole) => (
                                <span
                                  className="user-role-badge"
                                  key={userRole.id}
                                >
                                  {userRole.role.name}
                                </span>
                              ),
                            )
                          ) : (
                            <span className="user-no-role">
                              No Role
                            </span>
                          )}
                        </div>
                      </td>

                      <td>
                        <select
                          className="role-select"
                          value={selectedRoleId}
                          disabled={
                            savingUserId === user.id
                          }
                          onChange={(e) =>
                            handleRoleChange(
                              user,
                              Number(e.target.value),
                            )
                          }
                        >
                          <option value="">
                            Select Role
                          </option>

                          {roles.map((role) => (
                            <option
                              key={role.id}
                              value={role.id}
                            >
                              {role.name}
                            </option>
                          ))}
                        </select>

                        {savingUserId === user.id && (
                          <span className="role-saving">
                            Saving...
                          </span>
                        )}
                      </td>

                      <td>
                        {formatDate(user.createdAt)}
                      </td>

                      <td>
                        {formatDate(user.updatedAt)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}