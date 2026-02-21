export const UI_STRINGS = {
  login: "Default Login Text",
  signup: "Default Signup Text",
} as const;

export const THEME_STRINGS = {
  light: "Light",
  dark: "Dark",
  system: "System",
} as const;

export const MARKETING_FALLBACKS = {
  title: "Ship your apps to the world easier with ",
  subtitle: "Your complete All-in-One solution for building SaaS services.",
} as const;

export const PAGE_METADATA = {
  pricing: "Pricing",
} as const;

export const MARKETING_STATS = {
  contributorCount: 9,
  developerCount: 2000,
} as const;

export const ERROR_MESSAGES = {
  patternGeneration: "Something went wrong trying to pick a pattern...",
  somethingWentWrong: "Something went wrong.",
  genericError: "Error",
} as const;

export const UI_LABELS = {
  loading: "Loading...",
  search: "Search",
  searchPlaceholder: "Search...",
  commandSearch: "Type a command or search...",
  noCommandsFound: "No commands found.",
} as const;

export const PLACEHOLDER_TEXT = {
  clusterName: "Name of your cluster",
  selectRegion: "Select a region",
} as const;

export const TOAST_MESSAGES = {
  success: {
    saved: "Your changes have been saved.",
    updated: "Your changes have been updated.",
    copied: "Copied to clipboard.",
    clusterCreated: "Your cluster has been created.",
    clusterSaved: "Your cluster config has been saved.",
    nameUpdated: "Your name has been updated.",
  },
  error: {
    somethingWentWrong: "Something went wrong.",
    pleaseTryAgain: "Please try again.",
    refreshAndTryAgain: "Please refresh the page and try again.",
    unexpectedError: "An unexpected error occurred. Please try again.",
    notSaved: "Your changes were not saved. Please try again.",
    clusterNotSaved: "Your cluster config was not saved. Please try again.",
    clusterNotCreated: "Your cluster was not created. Please try again.",
    clusterNotDeleted: "Your cluster was not deleted. Please try again.",
    nameNotUpdated: "Your name was not updated. Please try again.",
  },
} as const;

export const FORM_LABELS = {
  name: "Name",
  region: "Region",
  save: "Save",
  submit: "Submit",
  cancel: "Cancel",
  delete: "Delete",
  edit: "Edit",
  subscriptionPlan: "Subscription Plan",
  manageSubscription: "Manage Subscription",
  upgradeToPro: "Upgrade to PRO",
  yourName: "Your Name",
  planRenewsOn: "Your plan renews on ",
  planCancelsOn: "Your plan will be canceled on ",
} as const;

export const FORM_DESCRIPTIONS = {
  enterName: "Please enter your full name or a display name you are comfortable with.",
  currentPlan: "You are currently on the",
  createCluster: "Deploy your new k8s cluster in one-click.",
} as const;

export const DIALOG_MESSAGES = {
  deleteCluster: {
    title: "Are you sure you want to delete this cluster?",
    description: "This action cannot be undone.",
  },
} as const;
