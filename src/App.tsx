import "./App.css";
import { CanvasProvider } from "./CanvasContext";
import Canvas from "./components/Canvas";

function App() {
  return (
    <CanvasProvider>
      <Canvas></Canvas>
    </CanvasProvider>
  );
}

export default App;
