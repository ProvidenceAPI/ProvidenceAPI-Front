"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAppContext } from "src/contexts/AppContext";
import { userService } from "src/app/lib";
import Swal from "sweetalert2";
import { 
  Search, 
  X, 
  RefreshCw, 
  Edit2, 
  Trash2, 
  User, 
  Shield, 
  ShieldOff, 
  UserCheck, 
  UserX, 
  Loader2,
  ChevronLeft,
  ChevronRight,
  Phone,
  Mail,
  Calendar
} from "lucide-react";

interface UserData {
  id: string;
  name: string;
  lastname: string;
  email: string;
  phone?: string;
  rol: "user" | "admin" | "superadmin";
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
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "banned" | "cancelled"
  >("all");

  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const loadAllUsersOnce = useCallback(
    async (forceReload: boolean = false) => {
      if (dataLoaded && !forceReload) return;
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
          let normalizedRole: UserData["rol"] = "user";
          if (user.rol) {
            const roleStr = String(user.rol).toLowerCase();
            if (roleStr === "superadmin" || roleStr === "superAdmin") {
              normalizedRole = "superadmin";
            } else if (roleStr === "admin" || roleStr === "Admin") {
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
            rol: normalizedRole,
            status: normalizedStatus,
          };
        });

        setAllUsers(safeUsers);
        setUsers(safeUsers);
        setTotalUsers(safeUsers.length);
        setTotalPages(Math.ceil(safeUsers.length / 10));
        setDataLoaded(true);
      } catch (error: any) {
        console.error("Error cargando usuarios:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.message || "Error al cargar usuarios",
        });
      }
    },
    [dataLoaded],
  );

  const performFrontendSearch = useCallback(
    (searchValue: string) => {
      const searchLower = searchValue.toLowerCase();
      const filtered = allUsers.filter((user) => {
        if (statusFilter !== "all" && user.status !== statusFilter) {
          return false;
        }
        if (!searchLower) return true;

        return (
          user.name?.toLowerCase().includes(searchLower) ||
          user.email?.toLowerCase().includes(searchLower) ||
          user.phone?.toLowerCase().includes(searchLower) ||
          user.rol?.toLowerCase().includes(searchLower) ||
          user.status?.toLowerCase().includes(searchLower)
        );
      });

      setUsers(filtered);
      setTotalUsers(filtered.length);
      setTotalPages(Math.ceil(filtered.length / 10) || 1);
      setCurrentPage(1);
    },
    [allUsers, statusFilter],
  );

  useEffect(() => {
    if (!dataLoaded) {
      loadAllUsersOnce();
    }
  }, [dataLoaded, loadAllUsersOnce]);

  useEffect(() => {
    if (dataLoaded) {
      performFrontendSearch(searchTerm);
    }
  }, [dataLoaded, searchTerm, statusFilter, performFrontendSearch]);

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

    const previousUsers = [...users];
    const previousAllUsers = [...allUsers];

    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status: newStatus } : u)),
    );
    setAllUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status: newStatus } : u)),
    );

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
      setUsers(previousUsers);
      setAllUsers(previousAllUsers);

      console.error("Error updating status:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Error al actualizar estado",
      });
    }
  };

  const handleRoleChange = async (userId: string, newRole: UserData["rol"]) => {
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
      await loadAllUsersOnce(true);

      Swal.fire({
        icon: "success",
        title: "Rol actualizado",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error: any) {
      console.error("Error updating rol:", error);
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

    const originalUser = allUsers.find((u) => u.id === editingUser.id);
    if (!originalUser) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se encontró el usuario original",
      });
      return;
    }

    const hasStatusChanged = originalUser.status !== editingUser.status;
    const hasRoleChanged = originalUser.rol !== editingUser.rol;
    const hasEmailChanged = originalUser.email !== editingUser.email;
    const hasPhoneChanged = originalUser.phone !== editingUser.phone;

    if (
      !hasStatusChanged &&
      !hasRoleChanged &&
      !hasEmailChanged &&
      !hasPhoneChanged
    ) {
      setEditingUser(null);
      Swal.fire({
        icon: "info",
        title: "Sin cambios",
        text: "No se detectaron cambios en el usuario",
        timer: 1500,
        showConfirmButton: false,
      });
      return;
    }
    const previousUsers = [...users];
    const previousAllUsers = [...allUsers];

    setUsers((prev) =>
      prev.map((u) => (u.id === editingUser.id ? editingUser : u)),
    );
    setAllUsers((prev) =>
      prev.map((u) => (u.id === editingUser.id ? editingUser : u)),
    );

    const userToEdit = { ...editingUser };
    setEditingUser(null);

    try {
      if (hasStatusChanged) {
        await userService.updateUserStatus(userToEdit.id, userToEdit.status);
      }
      if (hasRoleChanged) {
        await userService.updateUserRole(userToEdit.id, userToEdit.rol);
      }
      if (hasEmailChanged || hasPhoneChanged) {
        const updateData: any = {};
        if (hasEmailChanged) {
          updateData.email = userToEdit.email;
        }
        if (hasPhoneChanged) {
          updateData.phone = userToEdit.phone || "";
        }
        await userService.updateUser(userToEdit.id, updateData);
      }
      await loadAllUsersOnce(true);

      Swal.fire({
        icon: "success",
        title: "Usuario actualizado",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error: any) {
      setUsers(previousUsers);
      setAllUsers(previousAllUsers);
      setEditingUser(userToEdit);

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
      await loadAllUsersOnce(true);

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

  const getRoleBadge = (rol: string) => {
    const safeRole = (rol || "user").toLowerCase();

    if (safeRole === "superadmin") {
      return (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 text-red-700 border border-red-200 text-xs font-medium">
          <Shield className="w-3 h-3" />
          <span>SuperAdmin</span>
        </div>
      );
    } else if (safeRole === "admin") {
      return (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-medium">
          <Shield className="w-3 h-3" />
          <span>Admin</span>
        </div>
      );
    } else {
      return (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 border border-gray-300 text-xs font-medium">
          <User className="w-3 h-3" />
          <span>Usuario</span>
        </div>
      );
    }
  };

  const getStatusBadge = (status: string) => {
    const statusLower = (status || "active").toLowerCase();

    if (statusLower === "active") {
      return (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 text-green-700 border border-green-200 text-xs font-medium">
          <UserCheck className="w-3 h-3" />
          <span>Activo</span>
        </div>
      );
    } else if (statusLower === "banned") {
      return (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 text-red-700 border border-red-200 text-xs font-medium">
          <UserX className="w-3 h-3" />
          <span>Baneado</span>
        </div>
      );
    } else if (statusLower === "cancelled") {
      return (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-50 text-gray-700 border border-gray-200 text-xs font-medium">
          <UserX className="w-3 h-3" />
          <span>Cancelado</span>
        </div>
      );
    }

    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 border border-gray-300 text-xs font-medium">
        <User className="w-3 h-3" />
        <span>{status}</span>
      </div>
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
    <div className="flex flex-wrap gap-1 sm:gap-2">
      {(isSuperAdmin || isAdmin) && (
        <button
          onClick={() => setEditingUser(user)}
          className="flex items-center gap-1 px-2 sm:px-3 py-1.5 text-xs sm:text-sm bg-blue-50 text-blue-700 hover:bg-blue-100 rounded border border-blue-200 transition-colors whitespace-nowrap"
          title="Editar usuario"
        >
          <Edit2 className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="hidden xs:inline">Editar</span>
        </button>
      )}
      {isSuperAdmin && user.rol !== "superadmin" && (
        <button
          onClick={() => handleDeleteUser(user.id)}
          className="flex items-center gap-1 px-2 sm:px-3 py-1.5 text-xs sm:text-sm bg-red-50 text-red-700 hover:bg-red-100 rounded border border-red-200 transition-colors whitespace-nowrap"
          title="Cancelar cuenta"
        >
          <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="hidden xs:inline">Cancelar</span>
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
      <div className="mt-2 flex flex-wrap gap-1">
        {roleLower === "admin" && (
          <button
            onClick={() => handleRoleChange(userId, "user")}
            className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 text-gray-700 hover:bg-gray-200 rounded border border-gray-300 transition-colors whitespace-nowrap"
            title="Cambiar a Usuario"
          >
            <ShieldOff className="w-3 h-3" />
            <span>Quitar Admin</span>
          </button>
        )}
        {roleLower === "user" && (
          <button
            onClick={() => handleRoleChange(userId, "admin")}
            className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 rounded border border-blue-200 transition-colors whitespace-nowrap"
            title="Cambiar a Admin"
          >
            <Shield className="w-3 h-3" />
            <span>Hacer Admin</span>
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

  const ITEMS_PER_PAGE = 10;
  const paginatedUsers = users.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  return (
    <div className="space-y-4 sm:space-y-6 px-3 sm:px-4 md:px-6">
      {/* Header */}
      <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 truncate">
              👥 Gestión de Usuarios
            </h1>
            <div className="flex flex-col xs:flex-row xs:items-center gap-1 xs:gap-3 mt-1 sm:mt-2">
              <p className="text-sm sm:text-base text-gray-600">
                Total: <span className="font-semibold">{totalUsers}</span> usuarios
              </p>
              {searchTerm && (
                <span className="text-xs sm:text-sm text-gray-500 px-2 py-1 bg-gray-100 rounded-full">
                  Filtrados: {users.length}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex flex-col xs:flex-row gap-3">
            {/* Select de filtro por estado */}
            <div className="relative flex-shrink-0">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full xs:w-[140px] px-3 py-2.5 text-sm border border-gray-300 rounded-lg bg-white hover:bg-gray-50 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-colors cursor-pointer appearance-none pl-4 pr-10"
              >
                <option value="all">Todos los estados</option>
                <option value="active">Activos</option>
                <option value="banned">Baneados</option>
                <option value="cancelled">Cancelados</option>
              </select>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            
            {/* Buscador */}
            <div className="relative flex-1 xs:flex-none xs:w-48 sm:w-56 md:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar usuarios..."
                className="w-full px-4 py-2.5 pl-10 pr-10 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-colors"
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    performFrontendSearch(searchTerm);
                  }
                }}
              />
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  title="Limpiar búsqueda"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            
            {/* Botón de refrescar */}
            <button
              onClick={() => {
                setDataLoaded(false);
                setCurrentPage(1);
                setSearchTerm("");
              }}
              className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg border border-gray-300 transition-colors whitespace-nowrap flex-shrink-0"
              title="Refrescar"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden xs:inline">Refrescar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal de edición */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 w-full max-w-sm sm:max-w-md max-h-[90vh] overflow-y-auto shadow-xl mx-2 sm:mx-4">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
                  ✏️ Editar Usuario
                </h3>
                <p className="text-sm text-gray-600 mt-1 truncate">
                  {editingUser.name || "Sin nombre"} {editingUser.lastname || ""}
                </p>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className="text-gray-500 hover:text-gray-700 p-1"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
            
            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="email"
                    className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                    value={editingUser.email}
                    onChange={(e) =>
                      setEditingUser({ ...editingUser, email: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="tel"
                    className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                    value={editingUser.phone || ""}
                    onChange={(e) =>
                      setEditingUser({ ...editingUser, phone: e.target.value })
                    }
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado
                </label>
                <select
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
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
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                  value={editingUser.rol}
                  onChange={(e) =>
                    setEditingUser({
                      ...editingUser,
                      rol: e.target.value as "user" | "admin" | "superadmin",
                    })
                  }
                  disabled={!isSuperAdmin || editingUser.rol === "superadmin"}
                >
                  <option value="user">Usuario</option>
                  <option value="admin">Admin</option>
                  {editingUser.rol === "superadmin" && (
                    <option value="superadmin">SuperAdmin</option>
                  )}
                </select>
              </div>
              
              <div className="flex gap-2 sm:gap-3 pt-3 sm:pt-4">
                <button
                  onClick={handleSaveUser}
                  className="flex-1 bg-red-600 text-white py-2.5 text-sm sm:text-base rounded-lg font-medium hover:bg-red-700 transition-colors"
                >
                  Guardar
                </button>
                <button
                  onClick={() => setEditingUser(null)}
                  className="flex-1 bg-gray-200 text-gray-700 py-2.5 text-sm sm:text-base rounded-lg font-medium hover:bg-gray-300 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabla de usuarios */}
      <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading && !dataLoaded ? (
          <div className="p-8 sm:p-12 text-center">
            <Loader2 className="animate-spin w-8 h-8 text-red-600 mx-auto mb-4" />
            <p className="text-gray-600">Cargando usuarios...</p>
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            {/* Versión móvil - Cards */}
            <div className="block sm:hidden">
              {paginatedUsers.length > 0 ? (
                <div className="space-y-3 p-3">
                  {paginatedUsers.map((user) => (
                    <div key={user.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {user.name || "Sin nombre"} {user.lastname || ""}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            {getRoleBadge(user.rol)}
                            {getStatusBadge(user.status)}
                          </div>
                        </div>
                        <ActionButtons user={user} />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-700 truncate">{user.email}</span>
                        </div>
                        
                        {user.phone && (
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-700">{user.phone}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Calendar className="w-4 h-4" />
                          <span>Registro: {formatDate(user.createdAt)}</span>
                        </div>
                      </div>
                      
                      <QuickRoleButtons userId={user.id} currentRole={user.rol} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-500">
                    {searchTerm ? (
                      <>
                        <p className="text-lg">No se encontraron usuarios</p>
                        <p className="text-sm mt-2">Buscando: "{searchTerm}"</p>
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
                </div>
              )}
            </div>

            {/* Versión desktop - Tabla */}
            <table className="hidden sm:table w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs sm:text-sm font-semibold text-gray-700">Usuario</th>
                  <th className="text-left px-4 py-3 text-xs sm:text-sm font-semibold text-gray-700">Contacto</th>
                  <th className="text-left px-4 py-3 text-xs sm:text-sm font-semibold text-gray-700">Rol</th>
                  <th className="text-left px-4 py-3 text-xs sm:text-sm font-semibold text-gray-700">Estado</th>
                  <th className="text-left px-4 py-3 text-xs sm:text-sm font-semibold text-gray-700">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedUsers.length > 0 ? (
                  paginatedUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">
                          {user.name || "Sin nombre"} {user.lastname || ""}
                        </div>
                        <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Registro: {formatDate(user.createdAt)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-900 truncate max-w-[200px]">{user.email}</span>
                          </div>
                          {user.phone && (
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-700">{user.phone}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-2">
                          {getRoleBadge(user.rol)}
                          <QuickRoleButtons userId={user.id} currentRole={user.rol} />
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(user.status)}
                      </td>
                      <td className="px-4 py-3">
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
                            <p className="text-lg">No se encontraron usuarios</p>
                            <p className="text-sm mt-2">Buscando: "{searchTerm}"</p>
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

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4">
          <div className="flex flex-col xs:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-600">
              Mostrando <span className="font-semibold">{Math.min(ITEMS_PER_PAGE, paginatedUsers.length)}</span> de <span className="font-semibold">{users.length}</span> usuarios
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-1 px-3 sm:px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-gray-300"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden xs:inline">Anterior</span>
              </button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-sm rounded-lg border ${
                        currentPage === pageNum
                          ? "bg-red-600 text-white border-red-600"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                      } transition-colors`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 px-3 sm:px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-gray-300"
              >
                <span className="hidden xs:inline">Siguiente</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}