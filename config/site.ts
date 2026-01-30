export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "Task Manager",
  description: "Sistema de gestión de tareas moderno y eficiente.",
  navItems: [
    {
      label: "Home",
      href: "/",
    },
    {
      label: "Usuarios",
      href: "/usuarios",
      role: "admin",
    },
    {
      label: "Tareas",
      href: "/tareas",
    },
    {
      label: "Proyectos",
      href: "/proyectos",
    },
    {
      label: "Comentarios",
      href: "/comentarios",
    },
    {
      label: "Historial",
      href: "/historial",
    },
    {
      label: "Notificaciones",
      href: "/notificaciones",
    },
    {
      label: "Busqueda",
      href: "/busqueda",
    },
    {
      label: "Reportes",
      href: "/reportes",
    },
  ],
  navMenuItems: [
    {
      label: "Team",
      href: "/team",
    },
    {
      label: "Calendar",
      href: "/calendar",
    },
    {
      label: "Settings",
      href: "/settings",
    },
    {
      label: "Help & Feedback",
      href: "/help-feedback",
    },
    {
      label: "Logout",
      href: "/logout",
    },
  ],
};
