import Image from "next/image";
import { getTranslations } from "next-intl/server";

function IconUp(props: React.SVGProps<SVGSVGElement>) {
  return (
    // mm:I3390:10349;313:8426;186:1766
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M8.49945 18.3104L5.68945 15.5004L12.0595 9.12043H7.10945V5.69043H18.3095V16.8904H14.8895V11.9404L8.49945 18.3104Z"
        fill="currentColor"
      />
    </svg>
  );
}

export async function SunKudosSection() {
  const t = await getTranslations("SunKudos");

  return (
    // mm:3390:10349
    <section className="relative mx-auto w-full max-w-[1152px] min-h-[560px] overflow-hidden rounded-2xl lg:h-[500px] lg:min-h-0">
      {/* mm:I3390:10349;313:8415 */}
      <div className="absolute inset-0">
        {/* mm:I3390:10349;313:8416 */}
        <Image
          src="/home/Kudos_Background.png"
          alt=""
          fill
          priority
          className="rounded-2xl object-cover"
        />

        {/* mm:I3390:10349;313:8419 — relative flow on mobile/tablet, absolute at design position on desktop */}
        <div
          className="relative flex w-full flex-col items-start justify-center gap-6 px-6 py-10 sm:gap-8 sm:px-10 sm:py-12 lg:absolute lg:left-[65px] lg:top-[45px] lg:w-[470px] lg:px-0 lg:py-0"
        >
          {/* mm:I3390:10349;313:8420 */}
          <div className="flex w-full max-w-[470px] flex-col items-start gap-4">
            {/* mm:I3390:10349;313:8421 */}
            <p
              className="text-left text-white"
              style={{
                fontFamily: "var(--font-montserrat)",
                fontWeight: 700,
                fontSize: 24,
                lineHeight: "32px",
              }}
            >
              {t("heading")}
            </p>

            {/* mm:I3390:10349;313:8422 */}
            <p
              className="text-left text-3xl leading-tight sm:text-4xl sm:leading-tight lg:text-[57px] lg:leading-[64px]"
              style={{
                fontFamily: "var(--font-montserrat)",
                fontWeight: 700,
                letterSpacing: "-0.25px",
                color: "rgba(255, 234, 158, 1)",
              }}
            >
              {t("brandName")}
            </p>

            {/* mm:I3390:10349;313:8423 */}
            <p
              className="text-justify text-white"
              style={{
                fontFamily: "var(--font-montserrat)",
                fontWeight: 700,
                fontSize: 16,
                lineHeight: "24px",
                letterSpacing: "0.5px",
              }}
            >
              {t("highlightTitle")}
              <br />
              {t("description")}
            </p>
          </div>

          {/* mm:I3390:10349;313:8424 */}
          <div className="flex w-full max-w-[470px] flex-col items-start gap-6">
            {/* mm:I3390:10349;313:8426 */}
            <button
              type="button"
              className="flex items-center gap-2 rounded transition-colors duration-200 hover:bg-[#FFF3C4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFEA9E] focus-visible:ring-offset-2 active:translate-y-px"
              style={{
                padding: 16,
                backgroundColor: "rgba(255, 234, 158, 1)",
                color: "#00101A",
              }}
            >
              {/* mm:I3390:10349;313:8426;186:1935 */}
              <span className="flex items-center gap-1">
                {/* mm:I3390:10349;313:8426;186:1568 */}
                <span
                  style={{
                    fontFamily: "var(--font-montserrat)",
                    fontWeight: 700,
                    fontSize: 16,
                    lineHeight: "24px",
                    letterSpacing: "0.15px",
                    textAlign: "center",
                  }}
                >
                  {t("detailsButton")}
                </span>
              </span>
              <IconUp className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* mm:I3390:10349;313:8417 — decorative, desktop-only */}
        <div
          className="absolute hidden lg:block"
          style={{ left: 757, top: 141, width: 272, height: 219 }}
        />

        {/* mm:I3390:10349;329:2948 — decorative, desktop-only */}
        <div
          className="absolute hidden lg:block"
          style={{ left: 691, top: 215, width: 383, height: 76 }}
        >
          <Image
            src="/home/Logo_Kudos.svg"
            alt={t("brandName")}
            width={383}
            height={76}
          />
        </div>
      </div>
    </section>
  );
}
