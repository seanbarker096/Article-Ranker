import { Link } from "react-router-dom";

const Header = ({ user }) => {
  const renderHeader = () => {
    if (user) {
      return (
        <div className="ui inverted menu">
          <div className="item">
            <Link to="/">Article Ranker</Link>
          </div>
          <div className="right menu">
            <div className="item">
              <Link to="/users/me">{user.name}</Link>
            </div>
            <div className="item">
              <Link to="/signout">Sign Out</Link>
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div className="ui inverted menu">
          <div className="item">
            <Link to="/">Article Ranker</Link>
          </div>
          <div className="right menu">
            <div className="item">
              <Link to="/signup">Sign Up</Link>
            </div>
            <div className="item">
              <Link to="/signin">Sign In</Link>
            </div>
          </div>
        </div>
      );
    }
  };

  return renderHeader();
};

export default Header;
