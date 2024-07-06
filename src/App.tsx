import "./App.css";
import { CanvasProvider } from "./CanvasContext";
import Canvas from "./components/Canvas";

function App() {
  return (
    <>
      <CanvasProvider>
        <Canvas></Canvas>
      </CanvasProvider>
      <div style={{ margin: 32, fontSize: 20 }}>
        <h3>Управление:</h3>
        <li>Зажать лкм - интеракция с шариками</li>
        <li>Скм - добавить шарик</li>
        <li>Пкм по шарику - изменить цвет</li>
      </div>
    </>
  );
}

export default App;
