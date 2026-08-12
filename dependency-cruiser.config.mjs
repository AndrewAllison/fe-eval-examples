/** @type {import('dependency-cruiser').IConfiguration} */
export default {
  forbidden: [
    {
      name: "no-circular-dependencies",
      severity: "error",
      from: {},
      to: { circular: true },
    },
    {
      name: "no-orphans",
      severity: "error",
      from: {
        orphan: true,
        pathNot: ["(^|/)src/app/", "\\.test\\.[cm]?[jt]sx?$"],
      },
      to: {},
    },
    {
      name: "no-ui-to-server-infrastructure",
      severity: "error",
      from: { path: "^src/(components|features)" },
      to: {
        path: ["^src/db", "^src/config", "^src/lib/auth\\.ts$", "^src/lib/logger\\.ts$"],
      },
    },
  ],
  options: {
    doNotFollow: { path: "node_modules" },
    tsConfig: { fileName: "tsconfig.json" },
    enhancedResolveOptions: {
      conditionNames: ["types", "import", "default"],
      exportsFields: ["exports"],
    },
  },
};
