import { BRAND, EXTERNAL_URLS, GITHUB_REPO, CLI_COMMANDS, CONTACT } from "@saasfly/common";

export const siteConfig = {
  name: BRAND.name,
  description: BRAND.description,
  url: EXTERNAL_URLS.github.repo,
  ogImage: "",
  links: {
    github: EXTERNAL_URLS.github.repo,
  },
  github: GITHUB_REPO,
  cli: CLI_COMMANDS,
  support: CONTACT.support,
};
