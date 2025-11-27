import { BrowserRouter, Routes, Route } from "react-router";
import { routes } from "./config/RouterConfig";
import MainLayout from "./components/layout/index";
function App() {
  const params = new URLSearchParams(window.location.search);
  const orgid = params.get("orgid") || sessionStorage.getItem("orgid");
  sessionStorage.setItem("orgid", orgid);
  
  const routesWithLayout = routes.filter(route => route.layout !== false);
  const routesWithoutLayout = routes.filter(route => route.layout === false);
  
  return (
    <BrowserRouter>
      <Routes>
        {routesWithLayout.map((route, idx) => (
          <Route 
            key={idx} 
            path={route.path} 
            element={<MainLayout>{route.page}</MainLayout>} 
          />
        ))}
        {routesWithoutLayout.map((route, idx) => (
          <Route 
            key={`no-layout-${idx}`} 
            path={route.path} 
            element={route.page} 
          />
        ))}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
