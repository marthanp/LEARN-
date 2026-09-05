"use client";

import { useState } from "react";
import {
  Users,
  GraduationCap,
  BookOpen,
  ShieldAlert,
  Search,
  Filter,
  MoreHorizontal,
  UserCheck,
  UserX,
  Mail,
  ChevronDown,
  CheckCircle2,
  XCircle,
  Pencil,
  Trash2,
} from "lucide-react";

type UserRole = "learner" | "tutor" | "admin";
type UserStatus = "Active" | "Suspended" | "Pending" | "Superuser";

interface ManagedUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  joined: string;
  status: UserStatus;
  sessions?: number;
  lastSeen: string;
  avatarInitials: string;
  avatarColor: string;
}

const ALL_USERS: ManagedUser[] = [
  {
    id: "usr_01", name: "Aisha Nalubega", email: "aisha@university.edu",
    role: "learner", joined: "Sep 04, 2026", status: "Active",
    lastSeen: "2 hrs ago", avatarInitials: "AN", avatarColor: "bg-indigo-600",
  },
  {
    id: "usr_02", name: "Brian Ssemakula", email: "brian.tutor@learnplus.edu",
    role: "tutor", joined: "Aug 29, 2026", status: "Active", sessions: 120,
    lastSeen: "5 min ago", avatarInitials: "BS", avatarColor: "bg-purple-600",
  },
  {
    id: "usr_03", name: "Joel Mugisha", email: "joel@polytechnic.edu",
    role: "learner", joined: "Sep 02, 2026", status: "Active",
    lastSeen: "1 day ago", avatarInitials: "JM", avatarColor: "bg-emerald-600",
  },
  {
    id: "usr_04", name: "Dr. Maria Nanyonjo", email: "maria.bio@learnplus.edu",
    role: "tutor", joined: "Aug 15, 2026", status: "Active", sessions: 95,
    lastSeen: "30 min ago", avatarInitials: "MN", avatarColor: "bg-rose-600",
  },
  {
    id: "usr_05", name: "System Administrator", email: "admin@learnplus.edu",
    role: "admin", joined: "Aug 01, 2026", status: "Superuser",
    lastSeen: "Just now", avatarInitials: "SA", avatarColor: "bg-amber-600",
  },
  {
    id: "usr_06", name: "Grace Nakato", email: "grace.k@chemistry.edu",
    role: "tutor", joined: "Sep 01, 2026", status: "Active", sessions: 110,
    lastSeen: "10 min ago", avatarInitials: "GN", avatarColor: "bg-teal-600",
  },
  {
    id: "usr_07", name: "Peter Okello", email: "peter.okello@campus.edu",
    role: "tutor", joined: "Aug 20, 2026", status: "Active", sessions: 84,
    lastSeen: "3 hrs ago", avatarInitials: "PO", avatarColor: "bg-cyan-600",
  },
  {
    id: "usr_08", name: "Liam Chen", email: "liam.cs@university.edu",
    role: "tutor", joined: "Aug 10, 2026", status: "Active", sessions: 190,
    lastSeen: "1 hr ago", avatarInitials: "LC", avatarColor: "bg-blue-600",
  },
  {
    id: "usr_09", name: "Fatuma Wanjiru", email: "fatuma.w@student.edu",
    role: "learner", joined: "Sep 05, 2026", status: "Pending",
    lastSeen: "Just now", avatarInitials: "FW", avatarColor: "bg-pink-600",
  },
  {
    id: "usr_10", name: "Kevin Lubega", email: "kevin.l@learner.edu",
    role: "learner", joined: "Aug 30, 2026", status: "Suspended",
    lastSeen: "4 days ago", avatarInitials: "KL", avatarColor: "bg-slate-600",
  },
];

const ROLE_PILL: Record<UserRole, string> = {
  learner: "bg-emerald-50 text-emerald-700 border-emerald-200",
  tutor: "bg-purple-50 text-purple-700 border-purple-200",
  admin: "bg-amber-50 text-amber-700 border-amber-200",
};

const STATUS_PILL: Record<UserStatus, string> = {
  Active: "bg-emerald-50 text-emerald-700",
  Suspended: "bg-rose-50 text-rose-600",
  Pending: "bg-amber-50 text-amber-700",
  Superuser: "bg-indigo-50 text-indigo-700",
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<ManagedUser[]>(ALL_USERS);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState<"all" | UserRole>("all");
  const [filterStatus, setFilterStatus] = useState<"all" | UserStatus>("all");
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const filtered = users.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = filterRole === "all" || u.role === filterRole;
    const matchStatus = filterStatus === "all" || u.status === filterStatus;
    return matchSearch && matchRole && matchStatus;
  });

  const suspendUser = (id: string) =>
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, status: "Suspended" as UserStatus } : u))
    );

  const activateUser = (id: string) =>
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, status: "Active" as UserStatus } : u))
    );

  const changeRole = (id: string, role: UserRole) =>
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role } : u)));

  const deleteUser = (id: string) =>
    setUsers((prev) => prev.filter((u) => u.id !== id));

  const learnerCount = users.filter((u) => u.role === "learner").length;
  const tutorCount = users.filter((u) => u.role === "tutor").length;
  const adminCount = users.filter((u) => u.role === "admin").length;
  const activeCount = users.filter((u) => u.status === "Active" || u.status === "Superuser").length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-700 text-xs font-semibold mb-2">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Admin Console • Users & Role Management</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          User Management
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Assign roles, suspend accounts, and manage platform access for all registered users.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Users", value: users.length, color: "text-slate-900", bg: "bg-indigo-50", icon: Users },
          { label: "Learners", value: learnerCount, color: "text-emerald-700", bg: "bg-emerald-50", icon: GraduationCap },
          { label: "Tutors", value: tutorCount, color: "text-purple-700", bg: "bg-purple-50", icon: BookOpen },
          { label: "Active Sessions", value: activeCount, color: "text-indigo-700", bg: "bg-slate-50", icon: UserCheck },
        ].map(({ label, value, color, bg, icon: Icon }) => (
          <div key={label} className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">{label}</span>
              <div className={`w-9 h-9 rounded-xl ${bg} ${color} flex items-center justify-center`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
            <div className={`text-3xl font-black mt-2 ${color}`}>{value}</div>
          </div>
        ))}
      </div>

      {/* Table Panel */}
      <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm">
        {/* Table Toolbar */}
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row gap-3 sm:items-center">
          {/* Search */}
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name or email..."
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
            />
          </div>

          {/* Role Filter */}
          <div className="relative">
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value as typeof filterRole)}
              className="pl-3 pr-8 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none cursor-pointer appearance-none"
            >
              <option value="all">All Roles</option>
              <option value="learner">Learner</option>
              <option value="tutor">Tutor</option>
              <option value="admin">Admin</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
              className="pl-3 pr-8 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none cursor-pointer appearance-none"
            >
              <option value="all">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Pending">Pending</option>
              <option value="Suspended">Suspended</option>
              <option value="Superuser">Superuser</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
          </div>

          <span className="ml-auto text-xs text-slate-400 font-medium">{filtered.length} of {users.length} users</span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Last Seen</th>
                <th className="px-6 py-4">Joined</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/60 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl ${u.avatarColor} text-white flex items-center justify-center font-bold text-xs shrink-0`}>
                        {u.avatarInitials}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 text-xs">{u.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${ROLE_PILL[u.role]}`}>
                      {u.role === "learner" && <GraduationCap className="w-3 h-3" />}
                      {u.role === "tutor" && <BookOpen className="w-3 h-3" />}
                      {u.role === "admin" && <ShieldAlert className="w-3 h-3" />}
                      {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${STATUS_PILL[u.status]}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${u.status === "Active" || u.status === "Superuser" ? "bg-emerald-500" : u.status === "Suspended" ? "bg-rose-500" : "bg-amber-400"}`} />
                      {u.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500">{u.lastSeen}</td>
                  <td className="px-6 py-4 text-xs text-slate-400">{u.joined}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1.5">
                      {u.status === "Active" ? (
                        <button
                          onClick={() => suspendUser(u.id)}
                          title="Suspend user"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        >
                          <UserX className="w-4 h-4" />
                        </button>
                      ) : u.status === "Suspended" ? (
                        <button
                          onClick={() => activateUser(u.id)}
                          title="Activate user"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer"
                        >
                          <UserCheck className="w-4 h-4" />
                        </button>
                      ) : null}

                      {/* Role Quick-Change */}
                      <div className="relative">
                        <button
                          onClick={() => setOpenMenu(openMenu === u.id ? null : u.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                          title="Change role"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        {openMenu === u.id && (
                          <div className="absolute right-0 mt-1 w-40 bg-white border border-slate-200 rounded-2xl shadow-xl p-1.5 z-50">
                            <p className="text-[10px] uppercase font-bold text-slate-400 px-2 py-1">Assign Role</p>
                            {(["learner", "tutor", "admin"] as UserRole[]).map((r) => (
                              <button
                                key={r}
                                onClick={() => { changeRole(u.id, r); setOpenMenu(null); }}
                                className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${u.role === r ? "bg-indigo-50 text-indigo-700" : "hover:bg-slate-50 text-slate-600"}`}
                              >
                                {u.role === r && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />}
                                <span className="capitalize">{r}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {u.role !== "admin" && (
                        <button
                          onClick={() => deleteUser(u.id)}
                          title="Remove user"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-400">
                    No users match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
