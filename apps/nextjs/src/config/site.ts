export const siteConfig = {
  name: "Saasfly",
  description: "We provide an easier way to build saas service in production",
  url: "https://github.com/saasfly/saasfly",
  ogImage: "",
  links: {
    github: "https://github.com/saasfly/saasfly",
  },
  github: {
    owner: "saasfly",
    repo: "saasfly",
    // Set to null to fetch dynamically, or provide a string value
    stars: "2.5K",
  },
  cli: {
    // Primary installation command displayed on the homepage
    installCommand: "bun create saasfly",
    // Alternative commands for different package managers
    alternatives: {
      npm: "npx create-saasfly",
      yarn: "yarn create saasfly",
      pnpm: "pnpm create saasfly",
    },
  },
};
