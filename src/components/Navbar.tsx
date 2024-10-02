import { Link } from "react-router-dom";
import { AppName } from "../theme";
import "./Navbar.css";

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-left">
        <AppName>Coiner</AppName>
      </div>
      <ul className="navbar-list">
        <li className="navbar-item">
          <Link to="/">Coins</Link>
        </li>
        <li className="navbar-item">
          <Link to="/settings">Settings</Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
