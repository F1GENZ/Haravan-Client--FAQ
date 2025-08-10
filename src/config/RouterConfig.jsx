import Metafields from "../pages/metafields/index";  
import Login from "../pages/auth/login/index";
import GrandService from "../pages/auth/grandservice/index";

export const routes = [
  {
    path: "*",
    layout: false,
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
