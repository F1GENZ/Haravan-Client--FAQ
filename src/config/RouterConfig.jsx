import { lazy } from "react";

const Metafields = lazy(() => import("../pages/metafields/index"));
const Login = lazy(() => import("../pages/auth/login/index"));
const GrandService = lazy(() => import("../pages/auth/grandservice/index"));
const Introduction = lazy(() => import("../pages/introduction/index"));
const Guide = lazy(() => import("../pages/guide/index"));
const Storefront = lazy(() => import("../pages/storefront/index"));
const Contact = lazy(() => import("../pages/contact/index"));

export const routes = [
  {
    path: "/",
    layout: true,
    isPrivate: false,
    page: <Metafields />,
  },
  {
    path: "/products",
    layout: true,
    isPrivate: false,
    page: <Metafields />,
  },
  {
    path: "/collections",
    layout: true,
    isPrivate: false,
    page: <Metafields />,
  },
  {
    path: "/pages",
    layout: true,
    isPrivate: false,
    page: <Metafields />,
  },
  {
    path: "/storefront",
    layout: true,
    isPrivate: false,
    page: <Storefront />,
  },
  {
    path: "/introduction",
    layout: true,
    isPrivate: false,
    page: <Introduction />,
  },
  {
    path: "/guide",
    layout: true,
    isPrivate: false,
    page: <Guide />,
  },
  {
    path: "/contact",
    layout: true,
    isPrivate: false,
    page: <Contact />,
  },
  {
    path: "*",
    layout: true,
    isPrivate: false,
    page: <Metafields />,
  },
  {
    path: "/install/login",
    layout: false,
    isPrivate: false,
    page: <Login />,
  },
  {
    path: "/install/grandservice",
    layout: false,
    isPrivate: false,
    page: <GrandService />,
  },
];
