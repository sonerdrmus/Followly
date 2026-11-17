export const metricInfo: Record<string, { title: string; body: string }> = {
  followers: {
    title: 'Followers',
    body: 'The follower total supplied for the selected period. Followly does not estimate a count when the source omits it.',
  },
  following: {
    title: 'Following',
    body: 'The following total supplied for the selected period. Followly does not estimate a count when the source omits it.',
  },
  engagementRate: {
    title: 'Engagement rate',
    body: 'Shown only when the source provides the rate, or provides both the current and previous figures used for a change. Followly does not invent a denominator.',
  },
  reach: {
    title: 'Reach',
    body: 'Unique accounts that saw the content. Reach is not the same as impressions, which count every view.',
  },
  impressions: {
    title: 'Impressions',
    body: 'The number of times content was shown. One account can add more than one impression. Followly does not derive this from reach.',
  },
  profileVisits: {
    title: 'Profile visits',
    body: 'Profile visits supplied by Instagram Insights. Followly does not infer visits from follower changes.',
  },
  likes: {
    title: 'Likes',
    body: 'The like count supplied for the selected period. Followly does not estimate likes from reach or followers.',
  },
  comments: {
    title: 'Comments',
    body: 'The comment count supplied for the selected period.',
  },
  interactions: {
    title: 'Interactions',
    body: 'The interaction total supplied by the source. Followly does not add likes and comments together unless that total is already present.',
  },
  storyViews: {
    title: 'Story views',
    body: 'Story views supplied for this account type. A story screen does not create a view count.',
  },
  storyReach: {
    title: 'Story reach',
    body: 'Unique accounts reached by stories, when Instagram grants that field.',
  },
  storyInteractions: {
    title: 'Story interactions',
    body: 'Story interactions supplied by the source, such as taps that Instagram includes in that total.',
  },
  storyReplies: {
    title: 'Replies',
    body: 'Story replies supplied by the source.',
  },
  storyExits: {
    title: 'Exits',
    body: 'Story exits appear only when the source includes them. Followly does not calculate exits from views.',
  },
};

export function infoForMetric(key: string): { title: string; body: string } {
  return (
    metricInfo[key] ?? {
      title: 'Metric',
      body: 'This metric is shown only when a supported source provides it.',
    }
  );
}
