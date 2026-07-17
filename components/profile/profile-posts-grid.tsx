import { ProfileKudoPostCard } from "./profile-kudo-post-card";
import { PROFILE_KUDO_POSTS, type ProfileKudoPostData } from "./profile-kudo-posts-data";

export interface ProfilePostsGridProps {
  posts?: ProfileKudoPostData[];
}

// mm:362:5091 (mms_D_Post all) — vertical stack of KUDO post cards on the
// Profile screen, defaults to the four posts extracted from Figma.
export function ProfilePostsGrid({ posts = PROFILE_KUDO_POSTS }: ProfilePostsGridProps) {
  return (
    <div className="flex w-full flex-col items-start gap-6">
      {posts.map((post) => (
        <ProfileKudoPostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
