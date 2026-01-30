export type DashboardModule = {
  label: string;
  href: string;
  icon: keyof typeof dashboardIcons;
  role?: "admin";
};

// Claves de iconos usadas en el dashboard
export const dashboardIcons = {
  tareas: "tareas",
  proyectos: "proyectos",
  comentarios: "comentarios",
  historial: "historial",
  notificaciones: "notificaciones",
  busqueda: "busqueda",
  reportes: "reportes",
  usuarios: "usuarios",
  home: "home",
} as const;

export const dashboardModules: DashboardModule[] = [
  { label: "Tareas", href: "/tareas", icon: "tareas" },
  { label: "Proyectos", href: "/proyectos", icon: "proyectos" },
  { label: "Comentarios", href: "/comentarios", icon: "comentarios" },
  { label: "Historial", href: "/historial", icon: "historial" },
  { label: "Notificaciones", href: "/notificaciones", icon: "notificaciones" },
  { label: "Búsqueda", href: "/busqueda", icon: "busqueda" },
  { label: "Reportes", href: "/reportes", icon: "reportes" },
  { label: "Usuarios", href: "/usuarios", icon: "usuarios", role: "admin" },
];
