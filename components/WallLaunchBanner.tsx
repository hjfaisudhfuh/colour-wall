import { MonoTag } from "./MonoTag";

/**
 * Launch announcement section sitting at the top of the wall section.
 * Different job from WallStats inside the mat: this is the brand statement
 * (what this place is), WallStats is the live status counter.
 *
 * "First 100" framing is honest while claims < 100. Manually update once
 * the wall crosses that milestone — or wire it conditionally later.
 */
export function WallLaunchBanner() {
  return (
    <div className="mx-auto mb-5 max-w-2xl text-center">
      <div className="flex justify-center">
        <MonoTag>The First Wall Is Live</MonoTag>
      </div>
      <p className="mt-3 text-base text-zinc-700 sm:text-lg">
        10,000 spaces. $1 each. When it fills, The Million Wall opens.
      </p>
      <p className="mt-2 text-sm italic text-rose-700/80">
        Start a chain — claim next to a friend.
      </p>
    </div>
  );
}
