import Metafields from "../pages/metafields/index";  
import Login from "../pages/auth/login/index";
import GrandService from "../pages/auth/grandservice/index";
import Introduction from "../pages/introduction/index";
import Guide from "../pages/guide/index";

export const routes = [
  {
    path: "/",
    layout: true,
    isPrivate: false,
    page: <Metafields />,
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
