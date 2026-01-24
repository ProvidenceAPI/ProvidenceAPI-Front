"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAppContext } from "src/contexts/AppContext";
import { userService } from "src/app/lib";
import type { User } from "src/app/lib";
import Swal from "sweetalert2";

interface UserData {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: "user" | "admin" | "superadmin";
  status: "active" | "banned" | "cancelled";
  createdAt?: string;
}

interface ApiResponse {
  users?: UserData[];
  data?: UserData[];
  pages?: number;
  total?: number;
}

export default function UsersTab() {
  const { isSuperAdmin = false, isAdmin = false } = useAppContext();
  const [users, setUsers] = useState<UserData[]>([]);
  const [allUsers, setAllUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [dataLoaded, setDataLoaded] = useState(false);

  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const loadAllUsersOnce = useCallback(async () => {
    if (dataLoaded) return;
    try {
      const data: any = await userService.getUsers(1, 1000, "");
      let fetchedUsers: UserData[] = [];
      if (data?.users && Array.isArray(data.users)) {
        fetchedUsers = data.users;
      } else if (data?.data && Array.isArray(data.data)) {
        fetchedUsers = data.data;
      } else if (Array.isArray(data)) {
        fetchedUsers = data;
      }

      const safeUsers: UserData[] = fetchedUsers.map((user) => {
        let normalizedRole: UserData["role"] = "user";
        if (user.role) {
          const roleStr = String(user.role).toLowerCase();
          if (roleStr === "superadmin" || roleStr === "super-admin") {
            normalizedRole = "superadmin";
          } else if (roleStr === "admin" || roleStr === "administrator") {
            normalizedRole = "admin";
          } else {
            normalizedRole = "user";
          }
        }

        let normalizedStatus: UserData["status"] = "active";
        if (user.status) {
          const statusStr = String(user.status).toLowerCase();
          if (statusStr === "active" || statusStr === "activo") {
            normalizedStatus = "active";
          } else if (statusStr === "banned" || statusStr === "baneado") {
            normalizedStatus = "banned";
          } else if (statusStr === "cancelled" || statusStr === "cancelado") {
            normalizedStatus = "cancelled";
          }
        }
        return {
          ...user,
          name: user.name || "",
          email: user.email || "",
          phone: user.phone || "",
          role: normalizedRole,
          status: normalizedStatus,
        };
      });

      setAllUsers(safeUsers);
      setUsers(safeUsers);
      setTotalUsers(safeUsers.length);
      setTotalPages(Math.ceil(safeUsers.length / 10));
      setDataLoaded(true);

      console.log("✅ Usuarios cargados:", safeUsers.length);
    } catch (error: any) {
      console.error("Error cargando usuarios:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Error al cargar usuarios",
      });
    }
  }, [dataLoaded]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data: ApiResponse = await userService.getUsers(
        currentPage,
        10,
        searchTerm,
      );
      let fetchedUsers: UserData[] = [];
      if (data?.users && Array.isArray(data.users)) {
        fetchedUsers = data.users;
        setTotalPages(data.pages || 1);
        setTotalUsers(data.total || data.users.length);
      } else if (data?.data && Array.isArray(data.data)) {
        fetchedUsers = data.data;
        setTotalPages(data.pages || 1);
        setTotalUsers(data.total || data.data.length);
      } else if (Array.isArray(data)) {
        fetchedUsers = data;
        setTotalPages(1);
        setTotalUsers(data.length);
      } else {
        fetchedUsers = [];
        setTotalPages(1);
        setTotalUsers(0);
      }

      const safeUsers: UserData[] = fetchedUsers.map((user) => {
        let normalizedRole: UserData["role"] = "user";
        if (user.role) {
          const roleStr = String(user.role).toLowerCase();
          if (roleStr === "superadmin" || roleStr === "super-admin") {
            normalizedRole = "superadmin";
          } else if (roleStr === "admin" || roleStr === "administrator") {
            normalizedRole = "admin";
          } else {
            normalizedRole = "user";
          }
        }

        let normalizedStatus: UserData["status"] = "active";
        if (user.status) {
          const statusStr = String(user.status).toLowerCase();
          if (statusStr === "active" || statusStr === "activo") {
            normalizedStatus = "active";
          } else if (statusStr === "banned" || statusStr === "baneado") {
            normalizedStatus = "banned";
          } else if (statusStr === "cancelled" || statusStr === "cancelado") {
            normalizedStatus = "cancelled";
          }
        }
        return {
          ...user,
          name: user.name || "",
          email: user.email || "",
          phone: user.phone || "",
          role: normalizedRole,
          status: normalizedStatus,
        };
      });

      setUsers(safeUsers);
    } catch (error: any) {
      console.error("Error fetching users:", error);
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
    if (!dataLoaded) {
      loadAllUsersOnce();
    }
    if (searchTerm) {
      performFrontendSearch(searchTerm);
    } else {
      fetchUsers();
    }
  }, [dataLoaded, currentPage, searchTerm]);

  const performFrontendSearch = useCallback(
    (searchValue: string) => {
      if (!searchValue.trim()) {
        setCurrentPage(1);
        fetchUsers();
        return;
      }

      const searchLower = searchValue.toLowerCase();

      const filtered = allUsers.filter((user) => {
        const userName = user.name || "";
        const userEmail = user.email || "";
        const userPhone = user.phone || "";
        const userRole = user.role || "user";
        const userStatus = user.status || "active";

        const matchesName = userName.toLowerCase().includes(searchLower);
        const matchesEmail = userEmail.toLowerCase().includes(searchLower);
        const matchesPhone = userPhone.toLowerCase().includes(searchLower);
        const matchesRole = userRole.toLowerCase().includes(searchLower);
        const matchesStatus = userStatus.toLowerCase().includes(searchLower);

        return (
          matchesName ||
          matchesEmail ||
          matchesPhone ||
          matchesRole ||
          matchesStatus
        );
      });

      setUsers(filtered);
      setTotalUsers(filtered.length);
      setTotalPages(Math.ceil(filtered.length / 10) || 1);
      setCurrentPage(1);
    },
    [allUsers],
  );

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchTerm(value);

      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      if (!value.trim()) {
        performFrontendSearch("");
        return;
      }

      searchTimeoutRef.current = setTimeout(() => {
        performFrontendSearch(value);
      }, 400);
    },
    [performFrontendSearch],
  );

  const handleStatusChange = async (
    userId: string,
    newStatus: UserData["status"],
  ) => {
    if (!isSuperAdmin) {
      Swal.fire({
        icon: "warning",
        title: "Sin permisos",
        text: "Solo SuperAdmin puede cambiar estados de usuario",
      });
      return;
    }

    const allowedStatuses = ["active", "banned", "cancelled"];
    if (!allowedStatuses.includes(newStatus)) {
      Swal.fire({
        icon: "error",
        title: "Estado inválido",
        text: "Solo se permiten: Activo, Baneado o Cancelado",
      });
      return;
    }

    const statusNames: Record<string, string> = {
      active: "Activo",
      banned: "Baneado",
      cancelled: "Cancelado",
    };

    const result = await Swal.fire({
      title: "¿Cambiar estado?",
      text: `¿Deseas cambiar el estado del usuario a ${statusNames[newStatus]}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, cambiar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) return;

    try {
      await userService.updateUserStatus(userId, newStatus);

      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, status: newStatus } : u)),
      );

      setAllUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, status: newStatus } : u)),
      );

      Swal.fire({
        icon: "success",
        title: "Estado actualizado",
        text: `Usuario cambiado a ${statusNames[newStatus]}`,
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error: any) {
      console.error("Error updating status:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Error al actualizar estado",
      });
    }
  };

  const handleRoleChange = async (
    userId: string,
    newRole: UserData["role"],
  ) => {
    if (!isSuperAdmin) {
      Swal.fire({
        icon: "warning",
        title: "Sin permisos",
        text: "Solo SuperAdmin puede cambiar roles",
      });
      return;
    }

    const roleNames: Record<string, string> = {
      user: "Usuario",
      admin: "Administrador",
      superadmin: "SuperAdmin",
    };

    const result = await Swal.fire({
      title: "¿Cambiar rol?",
      text: `¿Deseas cambiar el rol del usuario a ${roleNames[newRole]}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, cambiar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) return;

    try {
      await userService.updateUserRole(userId, newRole);

      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)),
      );
      setAllUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)),
      );

      Swal.fire({
        icon: "success",
        title: "Rol actualizado",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error: any) {
      console.error("Error updating role:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Error al actualizar rol",
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
      const originalUser = users.find((u) => u.id === editingUser.id);

      if (originalUser) {
        if (originalUser.status !== editingUser.status) {
          await userService.updateUserStatus(
            editingUser.id,
            editingUser.status,
          );
        }
        if (originalUser.role !== editingUser.role) {
          await userService.updateUserRole(editingUser.id, editingUser.role);
        }
        const updateData: any = {};
        if (originalUser.email !== editingUser.email) {
          updateData.email = editingUser.email;
        }
        if (originalUser.phone !== editingUser.phone) {
          updateData.phone = editingUser.phone || "";
        }
        if (Object.keys(updateData).length > 0) {
          await userService.updateUser(editingUser.id, updateData);
        }
      }
      setUsers((prev) =>
        prev.map((u) => (u.id === editingUser.id ? editingUser : u)),
      );
      setAllUsers((prev) =>
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
      console.error("Error saving user:", error);
      let errorMessage = "Error al actualizar usuario.";
      if (error.message && error.message.includes("400")) {
        errorMessage =
          "Error de validación. Verifica que los datos sean correctos.";
      } else if (error.message && error.message.includes("401")) {
        errorMessage = "Sesión expirada. Por favor, inicia sesión nuevamente.";
      } else if (error.message && error.message.includes("403")) {
        errorMessage = "No tienes permisos para realizar esta acción.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage,
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!isSuperAdmin) {
      Swal.fire({
        icon: "warning",
        title: "Sin permisos",
        text: "Solo SuperAdmin puede cancelar usuarios",
      });
      return;
    }

    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción cancelará la cuenta del usuario",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, cancelar cuenta",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) return;

    try {
      await userService.updateUserStatus(userId, "cancelled");
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, status: "cancelled" } : u)),
      );
      setAllUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, status: "cancelled" } : u)),
      );

      Swal.fire({
        icon: "success",
        title: "Cuenta cancelada",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error: any) {
      console.error("Error deleting user:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Error al cancelar cuenta",
      });
    }
  };

  const getRoleBadge = (role: string) => {
    const baseClasses = "px-2.5 py-1 rounded-full text-xs font-medium";
    const safeRole = (role || "user").toLowerCase();

    if (safeRole === "superadmin") {
      return (
        <span
          className={`${baseClasses} bg-red-50 text-red-700 border border-red-200`}
        >
          SuperAdmin
        </span>
      );
    } else if (safeRole === "admin") {
      return (
        <span
          className={`${baseClasses} bg-blue-50 text-blue-700 border border-blue-200`}
        >
          Admin
        </span>
      );
    } else {
      return (
        <span
          className={`${baseClasses} bg-gray-100 text-gray-700 border border-gray-300`}
        >
          Usuario
        </span>
      );
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2.5 py-1 rounded-full text-xs font-medium";
    const statusLower = (status || "active").toLowerCase();

    if (statusLower === "active") {
      return (
        <span
          className={`${baseClasses} bg-green-50 text-green-700 border border-green-200`}
        >
          Activo
        </span>
      );
    } else if (statusLower === "banned") {
      return (
        <span
          className={`${baseClasses} bg-red-50 text-red-700 border border-red-200`}
        >
          Baneado
        </span>
      );
    } else if (statusLower === "cancelled") {
      return (
        <span
          className={`${baseClasses} bg-gray-50 text-gray-700 border border-gray-200`}
        >
          Cancelado
        </span>
      );
    }

    return (
      <span
        className={`${baseClasses} bg-gray-100 text-gray-700 border border-gray-300`}
      >
        {status}
      </span>
    );
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleDateString("es-AR");
    } catch {
      return "-";
    }
  };

  const clearSearch = () => {
    setSearchTerm("");
    performFrontendSearch("");
  };

  interface ActionButtonsProps {
    user: UserData;
  }

  const ActionButtons = ({ user }: ActionButtonsProps) => (
    <div className="flex space-x-2">
      {(isSuperAdmin || isAdmin) && (
        <button
          onClick={() => setEditingUser(user)}
          className="px-3 py-1.5 text-sm bg-blue-50 text-blue-700 hover:bg-blue-100 rounded border border-blue-200 transition-colors"
          title="Editar usuario"
        >
          Editar
        </button>
      )}
      {isSuperAdmin && user.role !== "superadmin" && (
        <button
          onClick={() => handleDeleteUser(user.id)}
          className="px-3 py-1.5 text-sm bg-red-50 text-red-700 hover:bg-red-100 rounded border border-red-200 transition-colors"
          title="Cancelar cuenta"
        >
          Cancelar
        </button>
      )}
    </div>
  );

  interface QuickRoleButtonsProps {
    userId: string;
    currentRole: string;
  }

  const QuickRoleButtons = ({ userId, currentRole }: QuickRoleButtonsProps) => {
    if (!isSuperAdmin) return null;
    const roleLower = currentRole.toLowerCase();
    if (roleLower === "superadmin") return null;

    return (
      <div className="mt-2 space-x-2">
        {roleLower === "admin" && (
          <button
            onClick={() => handleRoleChange(userId, "user")}
            className="text-xs px-2 py-1 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded border border-gray-300 transition-colors"
            title="Cambiar a Usuario"
          >
            Quitar Admin
          </button>
        )}
        {roleLower === "user" && (
          <button
            onClick={() => handleRoleChange(userId, "admin")}
            className="text-xs px-2 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded border border-blue-200 transition-colors"
            title="Cambiar a Admin"
          >
            Hacer Admin
          </button>
        )}
      </div>
    );
  };

  if (typeof userService === "undefined") {
    return (
      <div className="p-8 text-center">
        <div className="text-red-600 text-xl mb-4">⚠️ Error de Importación</div>
        <p className="text-gray-700 mb-2">No se pudo cargar userService</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header  */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Gestión de Usuarios
            </h1>
            <p className="text-gray-600 mt-1">
              Total: {totalUsers} usuarios
              {searchTerm && (
                <span className="ml-2 text-sm text-gray-500">
                  (Filtrados: {users.length})
                </span>
              )}
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar usuarios..."
                  className="px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none w-64 transition-colors"
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      performFrontendSearch(searchTerm);
                    }
                  }}
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                {searchTerm && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    title="Limpiar búsqueda"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
              </div>
            </div>
            <button
              onClick={() => {
                setDataLoaded(false);
                setCurrentPage(1);
                setSearchTerm("");
              }}
              className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg border border-gray-300 transition-colors flex items-center space-x-2"
              title="Refrescar"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              <span>Refrescar</span>
            </button>
          </div>
        </div>
      </div>

      {/* MODAL  */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Editar Usuario
                </h3>
                <p className="text-gray-600 mt-1">
                  {editingUser.name || "Sin nombre"}
                </p>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  className="w-full border border-gray-300 px-3 py-2 rounded focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                  value={editingUser.email}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, email: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono
                </label>
                <input
                  type="tel"
                  className="w-full border border-gray-300 px-3 py-2 rounded focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                  value={editingUser.phone || ""}
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
                  className="w-full border border-gray-300 px-3 py-2 rounded focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                  value={editingUser.status}
                  onChange={(e) =>
                    setEditingUser({
                      ...editingUser,
                      status: e.target.value as
                        | "active"
                        | "banned"
                        | "cancelled",
                    })
                  }
                >
                  <option value="active">Activo</option>
                  <option value="banned">Baneado</option>
                  <option value="cancelled">Cancelado</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rol
                </label>
                <select
                  className="w-full border border-gray-300 px-3 py-2 rounded focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                  value={editingUser.role}
                  onChange={(e) =>
                    setEditingUser({
                      ...editingUser,
                      role: e.target.value as "user" | "admin" | "superadmin",
                    })
                  }
                  disabled={!isSuperAdmin || editingUser.role === "superadmin"}
                >
                  <option value="user">Usuario</option>
                  <option value="admin">Admin</option>
                  {editingUser.role === "superadmin" && (
                    <option value="superadmin">SuperAdmin</option>
                  )}
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSaveUser}
                  className="flex-1 bg-red-600 text-white py-2.5 rounded font-medium hover:bg-red-700 transition-colors"
                >
                  Guardar
                </button>
                <button
                  onClick={() => setEditingUser(null)}
                  className="flex-1 bg-gray-200 text-gray-700 py-2.5 rounded font-medium hover:bg-gray-300 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TABLA */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading && !dataLoaded ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando usuarios...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rol
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {users && users.length > 0 ? (
                  users.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">
                          {user.name || "Sin nombre"}
                        </div>
                        {user.phone && (
                          <div className="text-sm text-gray-500 mt-1">
                            {user.phone}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {user.email}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          Registro: {formatDate(user.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          {getRoleBadge(user.role)}
                          <QuickRoleButtons
                            userId={user.id}
                            currentRole={user.role}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          {getStatusBadge(user.status)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <ActionButtons user={user} />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center py-12">
                      <div className="text-gray-500">
                        {searchTerm ? (
                          <>
                            <p className="text-lg">
                              No se encontraron usuarios
                            </p>
                            <p className="text-sm mt-2">
                              Buscando: "{searchTerm}"
                            </p>
                            <button
                              onClick={clearSearch}
                              className="mt-4 text-red-600 hover:text-red-700 text-sm font-medium"
                            >
                              Limpiar búsqueda
                            </button>
                          </>
                        ) : (
                          "No hay usuarios registrados"
                        )}
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
        <div className="flex justify-center items-center space-x-4 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-gray-300"
          >
            Anterior
          </button>

          <span className="text-gray-700">
            Página {currentPage} de {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-gray-300"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
}
