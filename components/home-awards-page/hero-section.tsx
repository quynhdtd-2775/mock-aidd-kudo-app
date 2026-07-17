import Image from "next/image";
import { getTranslations } from "next-intl/server";

export async function HeroSection() {
  const t = await getTranslations("AwardsPage");

  return (
    // mm:313:8436 (owned nodes only: 313:8439, 313:8437, 313:8450, 313:8453)
    <section
      className="relative w-full overflow-hidden"
      style={{ backgroundColor: "rgba(0, 16, 26, 1)" }}
    >
      {/* mm:313:8437 */}
      <div className="absolute inset-x-0 top-[80px] h-[547px] w-full">
        {/* mm:2167:5138 */}
        <Image
          src="/home/keyvisual.png"
          alt=""
          fill
          priority
          className="object-cover"
        />
      </div>

      {/* mm:313:8439 — dark fade overlays the keyvisual so the title reads on dark */}
      <div
        className="absolute inset-x-0 top-0 h-[627px] w-full"
        style={{
          background:
            "linear-gradient(0deg, #00101A -4.23%, rgba(0, 19, 32, 0) 52.79%)",
        }}
      />

      {/* mm:313:8450 entrance fade-in for above-the-fold hero content; respects prefers-reduced-motion */}
      <style>{`
        @keyframes heroFadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .hero-fade-in-up { animation: heroFadeInUp 0.6s ease-out both; }
        @media (prefers-reduced-motion: reduce) {
          .hero-fade-in-up { animation: none; }
        }
      `}</style>

      {/* pt-46 = 88px absolute header + 96px design padding-top (scaled down on mobile/tablet) */}
      <div className="hero-fade-in-up relative mx-auto flex w-full max-w-[1440px] flex-col gap-12 px-4 pt-24 sm:gap-16 sm:px-8 sm:pt-32 lg:gap-30 lg:px-36 lg:pt-46">
        {/* mm:313:8450 */}
        <div className="flex w-full flex-col items-start gap-6 lg:gap-10">
          {/* mm:313:8451 */}
          <div className="flex flex-col items-start gap-2.5">
            {/* mm:2789:12915 */}
            <Image
              src="/home/Root_Further_Logo.png"
              alt={t("heroLogoAlt")}
              width={338}
              height={150}
              className="h-auto w-[220px] sm:w-[280px] lg:w-[338px]"
            />
          </div>
        </div>

        {/* mm:313:8453 */}
        <div className="flex w-full flex-col items-start gap-4">
          {/* mm:313:8454 */}
          <p
            className="w-full text-center"
            style={{
              fontFamily: "var(--font-montserrat)",
              fontWeight: 700,
              fontSize: 24,
              lineHeight: "32px",
              color: "rgba(255, 255, 255, 1)",
            }}
          >
            {t("heroEyebrow")}
          </p>

          {/* mm:313:8455 */}
          <div
            className="h-px w-full"
            style={{ backgroundColor: "rgba(46, 57, 64, 1)" }}
          />

          {/* mm:313:8456 */}
          <div className="flex w-full items-center justify-center gap-8">
            {/* mm:313:8457 */}
            <h1
              className="text-left text-3xl leading-tight sm:text-4xl sm:leading-tight lg:text-[57px] lg:leading-[64px]"
              style={{
                fontFamily: "var(--font-montserrat)",
                fontWeight: 700,
                letterSpacing: "-0.25px",
                color: "rgba(255, 234, 158, 1)",
              }}
            >
              {t("heroTitle")}
            </h1>
          </div>
        </div>
      </div>
    </section>
  );
}
