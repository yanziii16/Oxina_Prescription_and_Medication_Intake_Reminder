import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav>
      <Link to="/">🏥 Med Reminder</Link>

      <Link to="/">Dashboard</Link>

      <Link to="/add">+ Add Medication</Link>

      <Link to="/about">About</Link>
    </nav>
  );
}