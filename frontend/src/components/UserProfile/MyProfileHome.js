import { useState, useEffect } from "react";
import SideBar from "../SideBar";
import Analytics from "./Analytics";
import Profile from "./Profile";
import { getUser } from "../../actions";
import { useDispatch, useSelector } from "react-redux";
import { getUserSelector } from "../../selectors";

const MyProfileHome = () => {
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => getUserSelector(state));
  const currentUserId = currentUser ? currentUser._id : null;
  useEffect(() => {
    dispatch(getUser());
  }, [dispatch]);

  const sideBarComponentNames = ["Profile", "Analytics"];
  const initialActiveChild = "Profile";
  const [activeChild, setActiveChild] = useState(initialActiveChild);

  const handleSideBarClick = (componentClicked) => {
    setActiveChild(componentClicked);
  };

  const renderChild = () => {
    if (activeChild === "Analytics" && currentUser) {
      return <Analytics userId={currentUserId} />;
    }
    if (activeChild === "Profile" && currentUser) {
      return <Profile user={currentUser} />;
    } else return null;
  };
  return (
    <div className="ui grid">
      <div className="four wide stretched column">
        <SideBar
          componentNames={sideBarComponentNames}
          parentClickHandler={handleSideBarClick}
          defaultActiveName={initialActiveChild}
        />
      </div>
      <div className="twelve wide stretched column">
        <div className="ui container">{renderChild()}</div>
      </div>
    </div>
  );
};

export default MyProfileHome;
