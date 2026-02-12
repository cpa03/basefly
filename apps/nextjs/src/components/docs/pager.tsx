import Link from "next/link";
import { Doc } from "contentlayer/generated";

import { cn } from "@saasfly/ui";
import { buttonVariants } from "@saasfly/ui/button";
import { ChevronLeft, ChevronRight } from "@saasfly/ui/icons";

import { getDocsConfig } from "~/config/ui/docs";

interface DocsPagerProps {
  doc: Doc;
}

export function DocsPager({ doc }: DocsPagerProps) {
  const pager = getPagerForDoc(doc);

  if (!pager) {
    return null;
  }

  return (
    <div className="flex flex-row items-center justify-between">
      {pager?.prev?.href && (
        <Link
          href={pager.prev.href}
          className={cn(buttonVariants({ variant: "ghost" }))}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          {pager.prev.title}
        </Link>
      )}
      {pager?.next?.href && (
        <Link
          href={pager.next.href}
          className={cn(buttonVariants({ variant: "ghost" }), "ml-auto")}
        >
          {pager.next.title}
          <ChevronRight className="ml-2 h-4 w-4" />
        </Link>
      )}
    </div>
  );
}

export function getPagerForDoc(doc: Doc) {
  const flattenedLinks = [
    null,
    ...flatten(getDocsConfig("en").sidebarNav),
    null,
  ];
  const activeIndex = flattenedLinks.findIndex(
    (link) => doc.slug === link?.href,
  );
  const prev = activeIndex !== 0 ? flattenedLinks[activeIndex - 1] : null;
  const next =
    activeIndex !== flattenedLinks.length - 1
      ? flattenedLinks[activeIndex + 1]
      : null;
  return {
    prev,
    next,
  };
}

interface DocLink {
  items?: DocLink[];
  title?: string;
  href?: string;
}

export function flatten(links: DocLink[]): DocLink[] {
  return links.reduce((flat: DocLink[], link) => {
    return flat.concat(link.items ? flatten(link.items) : [link]);
  }, []);
}
