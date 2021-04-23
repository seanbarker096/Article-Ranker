import React from 'react';
import { Link } from 'react-router-dom';

import ArticleList from './articles/ArticleList';

const Home = () => {
    return (
        <div className="home">
            <div className="home_articleUploadButton">
                <Link to="/articles/new" className="ui button primary">
                    Upload an article
                </Link>
            </div>
            <div className="home_articleListContainer">
                <ArticleList />
            </div>
        </div>
    );
};

export default Home;
