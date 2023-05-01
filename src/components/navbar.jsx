import React, { Component } from "react";
import { Link } from "react-router-dom";
class Navbar extends Component {
  state = {};
  render() {
    return (
      <nav className="topnav">
        <Link to="/" className="noround">
          about
        </Link>
        <Link to="/image" className="noround">
          image
        </Link>
        <Link to="/object" className="noround">
          3d object
        </Link>
      </nav>
    );
  }
}

export default Navbar;
