import { getTranslations } from "next-intl/server";
import { PenIcon, PillActionButton, SearchIcon } from "./secondary-buttons";
import { WriteKudoLauncher } from "./write-kudo-launcher";

// mm:2940:13448 (Button chuc nang) — the two primary action pills sitting
// under the Kudos wordmark: "ghi nhận" prompt (opens the Viết Kudo modal via
// the client launcher) and Sunner profile search.

export async function FunctionButtons() {
  const t = await getTranslations("LiveBoard");

  return (
    // mm:2940:13448
    <div className="flex w-full max-w-[1152px] flex-wrap items-center gap-4">
      {/* mm:2940:13449 (A.1_Button ghi nhận) */}
      <WriteKudoLauncher
        icon={<PenIcon className="h-6 w-6 shrink-0" />}
        label={t("askPrompt")}
        className="flex-1 basis-[738px]"
      />

      {/* mm:2940:13450 (Tìm kiếm sunner) */}
      <PillActionButton
        icon={<SearchIcon className="h-6 w-6 shrink-0" />}
        label={t("searchSunnerProfile")}
        className="flex-1 basis-[381px]"
      />
    </div>
  );
}
