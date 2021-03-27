// //subdoc schema for storing votes on user object
// const mongoose = require('mongoose');

// // const arraySchema = new mongoose.Schema({
// //     score: Number,
// // });

// const voteSchema = new mongoose.Schema({
//     resourceId: mongoose.Schema.Types.ObjectId,
//     vote: Number,
// });
// module.exports = voteSchema;

//subdoc schema for storing votes on user object
const mongoose = require('mongoose');
const AppError = require('../utils/appError');

const votersSchema = new mongoose.Schema({
    voteVal: Number,
    voterId: mongoose.Schema.Types.ObjectId,
    voteDate: {
        type: Date,
        default: Date.now(),
    },
});

const voteSchema = new mongoose.Schema({
    resourceId: mongoose.Schema.Types.ObjectId,
    voteSum: { type: Number, default: 0 },
    voters: { type: [votersSchema], default: () => [] },
    resourceOwner: mongoose.Schema.Types.ObjectId,
});

voteSchema.statics.vote = async function (
    resourceId,
    newVoteVal,
    currentUserId
) {
    //check if this user has already voted by searching for vote by parent resourceid and userId
    let vote = await this.findOne({
        resourceId,
    });
    let match = false;
    let votersPrevVoteVal;
    if (vote) {
        //check if user has already voted
        vote.voters.forEach((voter) => {
            if (voter.voterId.equals(currentUserId)) {
                match = true;
                votersPrevVoteVal = voter.voteVal;
                if (
                    newVoteVal + votersPrevVoteVal > 1 ||
                    newVoteVal + votersPrevVoteVal < -1
                ) {
                    throw new AppError(
                        'You have already voted in this way before!',
                        400
                    );
                }
                //if new vote causes zero total then remove resource record from user document
                if (newVoteVal + votersPrevVoteVal === 0) {
                    vote.voters.remove({ _id: voter._id });
                }
                //otherwise update
                voter.voteVal = votersPrevVoteVal + newVoteVal;
                vote.voteSum += newVoteVal;
                //vote = await voter.save();
                //return vote;
            }
        });
        if (!match) {
            //else if user has note already voted then create new subdoc and add to total
            vote.voters.push({ voteVal: newVoteVal, voterId: currentUserId });
            vote.voteSum += newVoteVal;
        }
        vote = await vote.save();
    }
    //if no previous vote create new one
    if (!vote) {
        vote = await this.create({
            resourceId,
            voteSum: newVoteVal,
            voters: [{ voteVal: newVoteVal, voterId: currentUserId }],
        });
    }
    return {
        voteDoc: vote,
        votersVote: votersPrevVoteVal
            ? newVoteVal + votersPrevVoteVal
            : newVoteVal,
        voterId: currentUserId,
    };
};

voteSchema.statics.getVotes = async function (queryObj, CommentVotesModel) {
    //queryObj could contain number of voters to get info from, articleIds. Can
    //also specifiy in url if want to return voter profiles and how many to return
    let { ids = [], includeVoterInfo = false } = queryObj;
    //if requested voters then include 20
    const maxVoters = includeVoterInfo ? queryObj.maxVoters || 20 : 0;
    //convert ids to ObjectIds
    ids = ids.map((id) => mongoose.Types.ObjectId(id));
    //if looking for commentsVotes then do simple match based on the commentIds array
    if (this.collection.name === 'CommentVotes') {
        const result = await this.aggregate([
            {
                //find articleVotes based on queryObj
                $match: {
                    resourceId: {
                        $in: ids,
                    },
                },
            },
        ]);
        return result;
    }
    //else if looking for articleVotes need to also add commentsVotes in
    const result = await this.aggregate([
        {
            //find articleVotes based on queryObj
            $match: {
                resourceId: {
                    $in: ids,
                },
            },
        },
        {
            $addFields: {
                voters: {
                    $let: {
                        vars: {
                            numVoters: {
                                $cond: [maxVoters, -maxVoters, 0],
                            },
                        },
                        in: {
                            $slice: ['$voters', '$$numVoters'],
                        },
                    },
                },
            },
        },
        {
            //get commentIds
            $lookup: {
                from: Comment.collection.name,
                let: { articleId: '$resourceId' },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $eq: ['$articleId', '$$articleId'],
                            },
                        },
                    },
                ],
                as: 'commentIds',
            },
        },
        {
            //convert array of objects to array of ids
            $addFields: {
                commentIds: {
                    $map: {
                        input: '$commentIds',
                        as: 'obj',
                        in: '$$obj._id',
                    },
                },
            },
        },
        {
            //get commentsVotes based on commentIds
            $lookup: {
                from: CommentVotesModel.collection.name,
                let: { commentIds: '$commentIds' },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $in: ['$resourceId', '$$commentIds'],
                            },
                        },
                    },
                ],
                as: 'commentsVotes',
            },
        },
        {
            $addFields: {
                'commentsVotes.voters': {
                    $let: {
                        vars: {
                            numVoters: {
                                $cond: [maxVoters, -maxVoters, 0],
                            },
                        },
                        in: {
                            $slice: ['$commentsVotes.voters', '$$numVoters'],
                        },
                    },
                },
            },
        },
        {
            $project: {
                commentIds: 0,
            },
        },
    ]);
    // console.log(result);
    return result;
};
module.exports = voteSchema;
const Comment = require('./commentModel');
