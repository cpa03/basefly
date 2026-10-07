import React from "react";
import Image from "next/image";

import { BLOG_CARD_TOKENS, EXTERNAL_URLS, UI_LABELS } from "@saasfly/common";
import { FollowerPointerCard } from "@saasfly/ui";

export interface BlogCardProps {
  className?: string;
  role?: string;
  "aria-label"?: string;
  tabIndex?: number;
}

export const XBlogArticle = React.memo(function XBlogArticle({
  className = "",
  role = BLOG_CARD_TOKENS.defaultRole,
  "aria-label": ariaLabel = BLOG_CARD_TOKENS.defaultAriaLabel,
  tabIndex = 0,
}: BlogCardProps) {
  return (
    <div
      className={`${BLOG_CARD_TOKENS.container.base} ${className}`.trim()}
      role={role}
      aria-label={ariaLabel}
      tabIndex={tabIndex}
    >
      <FollowerPointerCard
        title={
          <TitleComponent
            title={blogContent.author}
            avatar={blogContent.authorAvatar}
          />
        }
      >
        <div className={BLOG_CARD_TOKENS.card.base}>
          <div className={BLOG_CARD_TOKENS.imageWrapper.base}>
            <Image
              src={blogContent.image}
              alt={blogContent.title}
              width={640}
              height={400}
              sizes="(max-width: 640px) 100vw, 320px"
              className={BLOG_CARD_TOKENS.image.base}
            />
          </div>
          <div className={BLOG_CARD_TOKENS.content.base}>
            <h2 className={BLOG_CARD_TOKENS.content.title}>
              {blogContent.title}
            </h2>
            <h2 className={BLOG_CARD_TOKENS.content.description}>
              {blogContent.description}
            </h2>
            <div className={BLOG_CARD_TOKENS.content.footer}>
              <span className={BLOG_CARD_TOKENS.content.date}>
                {blogContent.date}
              </span>
              <button
                type="button"
                className={BLOG_CARD_TOKENS.button.base}
                aria-label={`Read article: ${blogContent.title}`}
              >
                {UI_LABELS.readMore}
              </button>
            </div>
          </div>
        </div>
      </FollowerPointerCard>
    </div>
  );
});

const blogContent = {
  slug: "Making-Sense-of-React-Server-Components",
  author: "Nextify",
  date: "26th March, 2024",
  title: "Making Sense of React Server Components",
  description:
    "So, here's something that makes me feel old: React celebrated its 10th birthday this year!",
  image: EXTERNAL_URLS.cdn.sanity,
  authorAvatar: EXTERNAL_URLS.cdn.twitterProfile,
};

const TitleComponent = React.memo(function TitleComponent({
  title,
  avatar,
}: {
  title: string;
  avatar: string;
}) {
  return (
    <div className="flex items-center space-x-2">
      <Image
        src={avatar}
        height={20}
        width={20}
        sizes="20px"
        alt={`${title}'s avatar`}
        className="rounded-full border-2 border-white"
      />
      <p>{title}</p>
    </div>
  );
});
