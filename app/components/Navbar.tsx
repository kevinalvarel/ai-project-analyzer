import { Link } from "react-router";

const Navbar = () => {
  return (
    <nav className="navbar">
      <Link to="/">
        <p className="text-2xl font-bold text-gradient">El Resume</p>
      </Link>
      <Link to="/upload" className="primary-button w-fit">
        <p>Unggah Resume</p>
      </Link>
    </nav>
  );
};

export default Navbar;
