import { useState, useCallback } from "react";
import Layout from "./components/Layout.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Containers from "./pages/Containers.jsx";
import ContainerDetail from "./pages/ContainerDetail.jsx";
import Images from "./pages/Images.jsx";

export default function App() {
  const [route, setRoute] = useState("dashboard");
  const [selectedContainer, setSelectedContainer] = useState(null);

  const handleNavigate = useCallback((r) => {
    setRoute(r);
    setSelectedContainer(null);
  }, []);

  const handleSelectContainer = useCallback((id) => {
    setSelectedContainer(id);
    setRoute("container-detail");
  }, []);

  const handleBack = useCallback(() => {
    setSelectedContainer(null);
    setRoute("containers");
  }, []);

  return (
    <Layout currentRoute={route === "container-detail" ? "containers" : route} onNavigate={handleNavigate}>
      {route === "dashboard" && <Dashboard />}
      {route === "containers" && <Containers onSelectContainer={handleSelectContainer} />}
      {route === "container-detail" && selectedContainer && (
        <ContainerDetail id={selectedContainer} onBack={handleBack} />
      )}
      {route === "images" && <Images />}
    </Layout>
  );
}
