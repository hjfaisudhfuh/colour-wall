import { MonoTag } from "./MonoTag";

/**
 * Launch announcement section sitting at the top of the wall section.
 * Different job from WallStats inside the mat: this is the brand statement
 * (what this place is), WallStats is the live status counter.
 */
export function WallLaunchBanner() {
  return (
    <div className="mx-auto mb-5 max-w-2xl text-center">
      <div className="flex justify-center">
        <MonoTag>The First Wall Is Open</MonoTag>
      </div>
      <p className="mt-3 text-base text-zinc-700 sm:text-lg">
        10,000 spaces. $1 each. Every square is claimed by a real person.
      </p>
      <p className="mt-2 text-sm italic text-rose-700/80">
        Claim a square before it fills up.
      </p>
    </div>
  );
}
