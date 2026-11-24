import { useEffect } from "react";
import { Spin } from "antd";
import { useNavigate } from "react-router-dom";
import { parseSessionFragment, storeSession } from "../../../lib/session";

const GrandService = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const payload = parseSessionFragment(window.location.hash);
    if (!payload) {
      navigate("/install/login", { replace: true });
      return;
    }

    storeSession(payload);
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}${window.location.search}`
    );
    navigate("/", { replace: true });
  }, [navigate]);

  return <Spin size="large" fullscreen />;
};

export default GrandService;
