export const RESOURCE_TYPES = {
  products: {
    path: "/products",
    label: "sản phẩm",
    title: "Sản phẩm",
    searchPlaceholder: "Tìm kiếm sản phẩm...",
  },
  collections: {
    path: "/collections",
    label: "danh mục",
    title: "Danh mục",
    searchPlaceholder: "Tìm kiếm danh mục...",
  },
  pages: {
    path: "/pages",
    label: "trang",
    title: "Trang",
    searchPlaceholder: "Tìm kiếm trang...",
  },
};

export function resourceTypeFromPath(pathname) {
  const normalized = (pathname ?? "").replace(/\/+$/, "") || "/";
  if (normalized === "/") return "shop";
  const match = Object.entries(RESOURCE_TYPES).find(
    ([, config]) => config.path === normalized
  );
  return match ? match[0] : null;
}
