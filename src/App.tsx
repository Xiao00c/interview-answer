import "./App.css";

import TaskProcessor from "./taskProcessor";
import MapGenerator from "./mapGenerator";
import { useEffect, useState } from "react";

function App() {
  console.log(window.location.pathname);

  const [path, setPath] = useState<string>("");

  useEffect(() => {
    setPath(window.location.pathname);
  }, [window.location.pathname]);

  return (
    <>
      {path === "/taskProcessor" && <TaskProcessor />}

      {path === "/mapGenerator" && <MapGenerator />}
    </>
  );
}

export default App;
