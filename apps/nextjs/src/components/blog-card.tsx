import Image from "next/image";
import { EXTERNAL_URLS } from "@saasfly/common";
import { FollowerPointerCard } from "@saasfly/ui/following-pointer";
import { TRANSITION_PRESETS } from "@saasfly/common/config/ui";

export function XBlogArticle() {
  return (
    <div className="w-full max-w-xs sm:max-w-sm md:w-80">
      <FollowerPointerCard
        title={
          <TitleComponent
            title={blogContent.author}
            avatar={blogContent.authorAvatar}
          />
        }
      >
        <div className={`group relative h-full overflow-hidden rounded-2xl border border-zinc-100 bg-white transition ${TRANSITION_PRESETS.container} hover:shadow-xl`}>
          <div className="aspect-w-16 aspect-h-10 xl:aspect-w-16 xl:aspect-h-10 relative w-full overflow-hidden rounded-tl-lg rounded-tr-lg bg-gray-100">
             <Image
                  src={blogContent.image}
                  alt={blogContent.title}
                  width={640}
                  height={400}
                  className={`transform object-cover transition ${TRANSITION_PRESETS.container} group-hover:scale-95 group-hover:rounded-2xl`}
               />
          </div>
          <div className=" p-4">
            <h2 className="my-4 text-lg font-bold text-zinc-700">
              {blogContent.title}
            </h2>
            <h2 className="my-4 text-sm font-normal text-zinc-500">
              {blogContent.description}
            </h2>
            <div className="mt-10 flex flex-row items-center justify-between">
              <span className="text-sm text-gray-500">{blogContent.date}</span>
              <button
                type="button"
                className={`relative z-10 rounded-xl bg-black px-6 py-2 text-xs font-bold text-white transition-all ${TRANSITION_PRESETS.container} hover:bg-zinc-800 hover:scale-105 hover:shadow-lg active:scale-95 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2`}
                aria-label={`Read article: ${blogContent.title}`}
              >
                Read More
              </button>
            </div>
          </div>
        </div>
      </FollowerPointerCard>
    </div>
  );
}

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

const TitleComponent = ({
  title,
  avatar,
}: {
  title: string;
  avatar: string;
}) => (
  <div className="flex items-center space-x-2">
    <Image
      src={avatar}
      height={20}
      width={20}
      alt={`${title}'s avatar`}
      className="rounded-full border-2 border-white"
    />
    <p>{title}</p>
  </div>
);
