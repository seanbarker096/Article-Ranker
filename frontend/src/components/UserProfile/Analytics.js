import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getUserAnalytics } from "../../actions";
import useRequestStatus from "../../utils/customHooks/useRequestStatus";
import {
  userAnalyticsApiReqStatusSelector,
  userAnalyticsDataSelector,
} from "../../selectors";
import Graph from "../Graph";

const Analytics = ({ userId }) => {
  let commentActivity,
    voteActivity,
    formattedVoteData = [],
    formattedCommentData = [];
  const dispatch = useDispatch();
  const userAnalyticsReqStatus = useSelector((state) =>
    userAnalyticsApiReqStatusSelector(state)
  );
  const userAnalyticsData = useSelector((state) =>
    userAnalyticsDataSelector(state)
  );

  const stateRef = useRef();
  stateRef.current = userAnalyticsReqStatus;
  useEffect(() => {
    //get analytics data
    if (userId) {
      dispatch(getUserAnalytics({ userId }));
    }
  }, [dispatch, userId]);

  useRequestStatus(stateRef.current, null, null, "users");

  if (userAnalyticsData && userAnalyticsData.userActivity) {
    commentActivity = userAnalyticsData.userActivity.commentActivity;
    voteActivity = userAnalyticsData.userActivity.voteActivity;
    if (voteActivity.length > 0) {
      formattedVoteData = voteActivity.map((voteDoc) => {
        return [
          new Date(Date.parse(voteDoc.voteDate)).getDate(),
          voteDoc.voteVal,
        ];
      });
      formattedVoteData = [
        ["Day of Month", "Vote Value"],
        ...formattedVoteData,
      ];
    }
    if (commentActivity.length > 0) {
      formattedCommentData = commentActivity.map((comment) => {
        return [comment.dayOfTheYear, comment.count];
      });
      formattedCommentData = [
        ["Day of year", "Number of comments made"],
        ...formattedCommentData,
      ];
    }
  }

  const today = new Date();
  const lastDayOfMonth = new Date(
    today.getFullYear(),
    today.getMonth() + 1,
    0
  ).getDate();
  return (
    <div className="ui grid">
      <div className="column">
        <div className="ui segment">
          {formattedVoteData.length > 0 ? (
            <Graph
              data={formattedVoteData}
              title="Votes on Articles this month"
              yLabel="Vote Value"
              xLabel="Day of month"
              minX={0}
              maxX={lastDayOfMonth}
              minY={-1.5}
              maxY={1.5}
            />
          ) : (
            <div style={{ marginBottom: "20px" }}>
              {userAnalyticsReqStatus === "pending"
                ? "Loading"
                : "Vote on an article to show this data!"}
            </div>
          )}
          {formattedCommentData.length > 0 ? (
            <Graph
              data={formattedCommentData}
              title="Comments made this year"
              yLabel="No. of comments made"
              xLabel="Day of year"
              minX={0}
              maxX={today.getDay() + 7}
              minY={0}
              maxY={20}
            />
          ) : (
            <div>
              {userAnalyticsReqStatus === "pending"
                ? "Loading"
                : " Leave a comment to show this data!"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default Analytics;
