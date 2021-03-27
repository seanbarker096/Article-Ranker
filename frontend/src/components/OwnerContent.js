import isResourceOwner from "../utils/isResourceOwner";
import { useSelector } from "react-redux";

const OwnerContent = ({ children, ownerId }) => {
  const currentUser = useSelector((state) => state.entities.users.currentUser);
  if (currentUser && isResourceOwner(ownerId, currentUser._id)) {
    return <div className="owner-content">{children}</div>;
  } else return null;
};

export default OwnerContent;
