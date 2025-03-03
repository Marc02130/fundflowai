import { type RouteConfig, index } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  {
    path: "/auth",
    file: "routes/auth.tsx",
  },
  {
    path: "/dashboard",
    file: "routes/dashboard.tsx",
    children: [
      {
        path: "profile",
        file: "routes/dashboard.profile.tsx",
      },
      {
        path: "new",
        file: "routes/dashboard.new.tsx",
      }
    ]
  }
] satisfies RouteConfig;
