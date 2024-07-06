import "./App.css";
import { CanvasProvider } from "./CanvasContext";
import BallMenu from "./components/BallMenu";
import Canvas from "./components/Canvas";
import Vector2 from "./classes/Vector2";

function App() {
  return (
    <CanvasProvider>
      <Canvas></Canvas>
    </CanvasProvider>
  );
}

export default App;
