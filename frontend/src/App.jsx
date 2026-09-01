import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import AddMedication from './pages/addMedication';
import About from './pages/About';

export default function App() {
  return (
    <div>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/add" element={<AddMedication />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </div>
  );
}