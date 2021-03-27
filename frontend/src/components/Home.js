import React from "react";
import { Link } from "react-router-dom";

import ArticleList from "./articles/ArticleList";

const Home = () => {
  return (
    <div className="ui grid">
      <div className="sixteen wide column">
        <Link to="/articles/new" className="ui right floated button primary">
          Upload an article
        </Link>
      </div>
      <div className="sixteen wide column">
        <ArticleList />
      </div>
    </div>
  );
};

export default Home;
