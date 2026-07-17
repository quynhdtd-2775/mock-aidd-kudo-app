import Image from "next/image";

/**
 * mm:1210:12622 — Keyvisual: full-bleed 1440x512 background image with a
 * dark diagonal gradient "Cover" fading into the profile content below it.
 */
export function ProfileKeyvisual() {
  return (
    // mm:1210:12622
    <section className="relative w-full h-[512px]">
      {/* mm:I1210:12622;2167:5140 */}
      <div className="absolute inset-0 h-[512px] w-full">
        {/* mm:I1210:12622;2167:5141 */}
        <Image
          src="/profile/kv-background.png"
          alt=""
          fill
          priority
          className="object-cover"
        />
      </div>

      {/* mm:I1210:12622;1210:12612 — gradient fades the keyvisual into the section below */}
      <div
        className="absolute left-0 top-[445px] h-[957px] w-full"
        style={{
          background:
            "linear-gradient(8deg, #00101A 8.6%, rgba(0, 19, 32, 0.00) 37.25%)",
        }}
      />
    </section>
  );
}
