import type { AvatarProps } from "@radix-ui/react-avatar";

import { Avatar, AvatarFallback, AvatarImage } from "@saasfly/ui/avatar";
import { User } from "@saasfly/ui/icons";

interface UserAvatarProps extends AvatarProps {
  user: {
    name?: string | null;
    image?: string | null;
  };
}

export function UserAvatar({ user, ...props }: UserAvatarProps) {
  return (
    <Avatar {...props}>
      {user.image ? (
        <AvatarImage alt="Picture" src={user.image} />
      ) : (
        <AvatarFallback>
          <span className="sr-only">{user.name}</span>
          <User className="h-4 w-4" />
        </AvatarFallback>
      )}
    </Avatar>
  );
}
