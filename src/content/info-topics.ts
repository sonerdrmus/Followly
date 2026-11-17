export const infoTopics = {
  account: {
    title: 'Account settings',
    body: 'Followly account settings will appear here after sign-in exists. There is no account to edit in this build.',
  },
  notifications: {
    title: 'Notifications',
    body: 'Notification preferences are not available yet. Followly is not sending alerts.',
  },
  privacy: {
    title: 'Privacy and data',
    body: 'Privacy and data controls will let you review what Followly stores. This build does not store Instagram data.',
  },
  premium: {
    title: 'Followly Premium',
    body: 'Followly Premium is not available yet. There is no purchase and no subscription in this build.',
  },
  help: {
    title: 'Help and support',
    body: 'Help and support will be available in a later release. There is no support inbox in this build.',
  },
  about: {
    title: 'About Followly',
    body: 'Followly is an Instagram analytics app. Supported insights are meant to come from official Instagram access and exports you choose to import. This build does not connect to Instagram yet.',
  },
  snapshots: {
    title: 'Follower snapshots',
    body: 'A comparison needs two follower lists from an Instagram export you import. One list can show who was present. A second, later list is what makes new, lost, and mutual results possible. Import processing is not part of this build, and a result never means someone manually unfollowed you unless the source says so.',
  },
  'insights-access': {
    title: 'Metric access',
    body: 'Reach, impressions, profile visits, and story metrics appear only when Instagram grants those fields for the connected account type. A screen for a metric does not mean Followly already has that number.',
  },
} as const;

export type InfoTopic = keyof typeof infoTopics;

export function isInfoTopic(value: string): value is InfoTopic {
  return Object.prototype.hasOwnProperty.call(infoTopics, value);
}
