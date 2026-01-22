"use client";

import { useState, useEffect, useCallback } from "react";
import { useAppContext } from "src/contexts/AppContext";
import { userService, type User } from "src/app/lib";
import Swal from "sweetalert2";

export default function UsersTab() {
  const { isSuperAdmin, isAdmin } = useAppContext();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data: any = await userService.getUsers(currentPage, 10, searchTerm);
      let count = 0;
      if (Array.isArray(data)) {
        setUsers(data);
        setTotalPages(1);
        setTotalUsers(data.length);
        count = data.length;
      } else if (data?.users && Array.isArray(data.users)) {
        setUsers(data.users);
        setTotalPages(data.pages || 1);
        setTotalUsers(data.total || data.users.length);
        count = data.users.length;
      } else if (data?.data && Array.isArray(data.data)) {
        setUsers(data.data);
        setTotalPages(data.pages || 1);
        setTotalUsers(data.total || data.data.length);
        count = data.data.length;
      } else {
        setUsers([]);
        setTotalPages(1);
        setTotalUsers(0);
      }
    } catch (error: any) {
      setUsers([]);
      setTotalPages(1);
      setTotalUsers(0);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Error al cargar usuarios",
      });
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleStatusChange = async (
    userId: string,
    newStatus: User["status"],
  ) => {
    if (!isSuperAdmin) {
      Swal.fire({
        icon: "warning",
        title: "Sin permisos",
        text: "Solo SuperAdmin puede cambiar estados de usuario",
      });
      return;
    }
    try {
      await userService.updateUserStatus(userId, newStatus);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, status: newStatus } : u)),
      );
      Swal.fire({
        icon: "success",
        title: "Estado actualizado",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Error al actualizar estado",
      });
    }
  };

  const handleSaveUser = async () => {
    if (!editingUser) return;
    if (!isSuperAdmin) {
      Swal.fire({
        icon: "warning",
        title: "Sin permisos",
        text: "Solo SuperAdmin puede editar usuarios",
      });
      return;
    }

    try {
      await userService.updateUser(editingUser.id, {
        name: editingUser.name,
        email: editingUser.email,
        phone: editingUser.phone,
        status: editingUser.status,
      });

      setUsers((prev) =>
        prev.map((u) => (u.id === editingUser.id ? editingUser : u)),
      );
      setEditingUser(null);
      Swal.fire({
        icon: "success",
        title: "Usuario actualizado",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Error al actualizar usuario",
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!isSuperAdmin) {
      Swal.fire({
        icon: "warning",
        title: "Sin permisos",
        text: "Solo SuperAdmin puede eliminar usuarios",
      });
      return;
    }

    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) return;
    try {
      await userService.deleteUser(userId);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      Swal.fire({
        icon: "success",
        title: "Usuario eliminado",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Error al eliminar usuario",
      });
    }
  };

  const getRoleBadge = (role: User["role"]) => {
    const badges = {
      superAdmin: "bg-red-100 text-red-800",
      admin: "bg-blue-100 text-blue-800",
      user: "bg-gray-100 text-gray-800",
    };

    const labels = {
      superAdmin: "👑 SuperAdmin",
      admin: "👔 Admin",
      user: "👤 Usuario",
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${badges[role]}`}
      >
        {labels[role]}
      </span>
    );
  };

  const getStatusBadge = (status: User["status"]) => {
    const badges = {
      Active: "bg-green-100 text-green-800",
      Inactive: "bg-gray-100 text-gray-800",
      Suspended: "bg-red-100 text-red-800",
    };
    const labels = {
      Active: "✅ Activo",
      Inactive: "⏸️ Inactivo",
      Suspended: "🚫 Suspendido",
    };
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${badges[status]}`}
      >
        {labels[status]}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              👥 Lista de Usuarios
            </h1>
            <p className="text-gray-600 mt-1">
              Total: {totalUsers} usuarios registrados
            </p>
          </div>
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="🔍 Buscar por nombre o email..."
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>
      </div>
      {/* MODAL EDITAR */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">✏️ Editar Usuario</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre
                </label>
                <input
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-red-500"
                  placeholder="Nombre completo"
                  value={editingUser.name}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, name: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-red-500"
                  placeholder="email@ejemplo.com"
                  value={editingUser.email}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, email: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono
                </label>
                <input
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-red-500"
                  placeholder="Teléfono (opcional)"
                  value={editingUser.phone ?? ""}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, phone: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado
                </label>
                <select
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-red-500"
                  value={editingUser.status}
                  onChange={(e) =>
                    setEditingUser({
                      ...editingUser,
                      status: e.target.value as User["status"],
                    })
                  }
                >
                  <option value="active">✅ Activo</option>
                  <option value="inactive">⏸️ Inactivo</option>
                  <option value="suspended">🚫 Suspendido</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-red-500"
                  value={editingUser.role}
                  onChange={(e) =>
                    setEditingUser({
                      ...editingUser,
                      role: e.target.value as User["role"],
                    })
                  }
                >
                  <option value="superAdmin">👑 SuperAdmin</option>
                  <option value="admin">👔 Admin</option>
                  <option value="user">👤 Usuario</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSaveUser}
                  className="flex-1 bg-gradient-to-r from-red-600 to-orange-600 text-white py-2 rounded-lg font-medium hover:from-red-700 hover:to-orange-700 transition"
                >
                  💾 Guardar
                </button>
                <button
                  onClick={() => setEditingUser(null)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-400 transition"
                >
                  ✕ Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* TABLA */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando usuarios...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Teléfono
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Rol
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Fecha Registro
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users && users.length > 0
                  ? users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">
                            {user.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">
                            {user.email}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">
                            {user.phone ?? "-"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getRoleBadge(user.role)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(user.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">
                            {user.createdAt
                              ? new Date(user.createdAt).toLocaleDateString(
                                  "es-AR",
                                )
                              : "-"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex gap-2">
                            {isSuperAdmin ? (
                              <>
                                <button
                                  onClick={() => setEditingUser(user)}
                                  className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                                >
                                  ✏️ Editar
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(user.id)}
                                  className="text-red-600 hover:text-red-800 font-medium text-sm"
                                >
                                  🗑️ Eliminar
                                </button>
                              </>
                            ) : (
                              <span className="text-gray-400 text-sm">
                                🔒 Solo lectura
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  : null}
                {(!users || users.length === 0) && !loading && (
                  <tr>
                    <td colSpan={7} className="text-center py-12">
                      <div className="text-gray-400 text-lg">
                        📭 No se encontraron usuarios
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {/* PAGINACIÓN */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 bg-white rounded-xl shadow p-4">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className="px-4 py-2 bg-gray-200 rounded-lg font-medium hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            ← Anterior
          </button>
          <span className="text-gray-700 font-medium">
            Página {currentPage} de {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
            className="px-4 py-2 bg-gray-200 rounded-lg font-medium hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Siguiente →
          </button>
        </div>
      )}
    </div>
  );
}
