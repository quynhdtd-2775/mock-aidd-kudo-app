import Image from "next/image";

/**
 * mm:2940:13432 — Keyvisual: full-bleed 1440x512 background image with a
 * dark diagonal gradient "Cover" fading into the content below it.
 */
export function LiveBoardKeyvisual() {
  return (
    // mm:2940:13432
    <section className="relative w-full h-[512px]">
      {/* mm:I2940:13432;2167:5140 */}
      <div className="absolute inset-0 h-[512px] w-full">
        {/* mm:I2940:13432;2167:5141 */}
        <Image
          src="/kudos-live-board/kv-background.png"
          alt=""
          fill
          priority
          className="object-cover"
        />
      </div>

      {/* mm:I2940:13432;1210:12612 — gradient fades the keyvisual into the section below */}
      <div
        className="absolute left-0 top-[445px] h-[957px] w-full"
        style={{
          background:
            "linear-gradient(25deg, #00101A 14.74%, rgba(0, 19, 32, 0.00) 47.8%)",
        }}
      />
    </section>
  );
}
