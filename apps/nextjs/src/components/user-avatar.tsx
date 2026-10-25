import type { AvatarProps } from "@radix-ui/react-avatar";

import { AVATAR_TOKENS } from "@saasfly/common";
import { cn } from "@saasfly/ui";
import { Avatar, AvatarFallback, AvatarImage } from "@saasfly/ui/avatar";
import { User } from "@saasfly/ui/icons";

interface UserAvatarProps extends AvatarProps {
  user: {
    name?: string | null;
    image?: string | null;
  };
}

export function UserAvatar({
  user,
  className,
  ...props
}: UserAvatarProps): React.JSX.Element {
  const hoverScale: string = AVATAR_TOKENS.root.hoverScale;
  const activeScale: string = AVATAR_TOKENS.root.activeScale;
  const fallbackBase: string = AVATAR_TOKENS.fallback.base;

  return (
    <Avatar
      className={cn(
        hoverScale,
        activeScale,
        className,
      )}
      {...props}
    >
      {user.image ? (
        <AvatarImage
          alt={user.name ? `${user.name}'s avatar` : AVATAR_TOKENS.defaultAriaLabel}
          src={user.image}
        />
      ) : (
        <AvatarFallback className={fallbackBase}>
          <span className="sr-only">{user.name}</span>
          <User className="h-4 w-4" />
        </AvatarFallback>
      )}
    </Avatar>
  );
}
