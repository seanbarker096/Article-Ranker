import { useState } from "react";

const SideBar = ({ componentNames, parentClickHandler, defaultActiveName }) => {
  const noSpaceNames = componentNames.map((name) => name.split(" ").join(""));
  const [activeDiv, setActiveDiv] = useState({ [defaultActiveName]: "active" });
  const handleMouseOver = (e) => {
    //setActiveDiv({ [e.target.id]: "active" });
  };
  const handleMouseOut = (e) => {
    //setActiveDiv({});
  };
  const onClickHandler = (name) => {
    setActiveDiv({ [name]: "active" });
    parentClickHandler(name);
  };
  const renderComponents = () => {
    return componentNames.map((name, idx) => {
      return (
        <div
          onClick={() => onClickHandler(noSpaceNames[idx])}
          onMouseOver={(e) => handleMouseOver(e)}
          onMouseOut={(e) => handleMouseOut(e)}
          className={`item ${activeDiv[noSpaceNames[idx]]}`}
          id={noSpaceNames[idx]}
          key={name}
        >
          {name}
        </div>
      );
    });
  };
  return (
    <div className="ui vertical fluid tabular menu">{renderComponents()}</div>
  );
};

export default SideBar;
