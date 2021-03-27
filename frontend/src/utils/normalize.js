import { normalize as normalizer, schema } from "normalizr";
import _ from "lodash";

const getEntitiesObject = (resourceType, originalData) => {
  const entities = {};
  const options = {};

  if (resourceType === "articles") {
    options.idAttribute = "_id";
    if (!originalData[0].comments) {
      throw Error("Data must contain a comments key");
    }
    if (originalData.length === 0) {
      entities.comments = [];
      entities.articles = [];
      return entities;
    }
    entities.comments = new schema.Entity(
      "comments",
      //dont normalize commentOwner info here. Keep nested as no seperate state for comment owners,
      {},
      options
    );
    entities.articles = new schema.Entity(
      "articles",
      {
        comments: [entities.comments],
        //owner: entities.users,
      },
      //do not store comments to ensure dont add unbounded array to store
      options
    );
  } else if (resourceType === "articlesVotes") {
    //we want the keys of vote data to be either the article or commentId
    options.idAttribute = "resourceId";
    if (!originalData[0].commentsVotes) {
      throw Error("Data must contain a commentsVotes key");
    }
    if (originalData.length === 0) {
      entities.commentsVotes = [];
      entities.articlesVotes = [];
      return entities;
    }
    entities.commentsVotes = new schema.Entity("commentsVotes", {}, options);
    entities.articlesVotes = new schema.Entity(
      "articlesVotes",
      {
        commentsVotes: [entities.commentsVotes],
      },
      options
    );
  }

  return entities;
};

const normalize = (originalData, resourceType) => {
  if (!Array.isArray(originalData)) {
    originalData = [originalData];
  }

  const entities = getEntitiesObject(resourceType, originalData);

  return normalizer(originalData, [entities[resourceType]]);
};

export default normalize;
