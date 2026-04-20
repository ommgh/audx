export type InstallMethod = "shadcn" | "shadcn-vue" | "manual";

export const INSTALL_METHODS: InstallMethod[] = [
  "shadcn",
  "shadcn-vue",
  "manual",
];

export const INSTALL_METHOD_LABELS: Record<InstallMethod, string> = {
  shadcn: "React",
  "shadcn-vue": "Vue",
  manual: "Manual",
};

export const DEFAULT_IM: InstallMethod = "shadcn";
