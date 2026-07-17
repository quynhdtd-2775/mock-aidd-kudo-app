import { describe, it, expect } from "vitest";
import { mapCreateKudoErrorCode } from "./map-create-kudo-error";
import type { CreateKudoErrorCode } from "@/lib/kudos/kudos-types";

describe("mapCreateKudoErrorCode", () => {
  const identityT = (key: string) => key;

  it.each<[CreateKudoErrorCode, string]>([
    ["receiver_required", "errorReceiverRequired"],
    ["receiver_not_found", "errorReceiverNotFound"],
    ["award_title_required", "errorAwardTitleRequired"],
    ["message_required", "errorMessageRequired"],
    ["hashtags_count", "errorHashtagsCount"],
    ["too_many_images", "errorTooManyImages"],
    ["invalid_image_type", "errorInvalidImageType"],
    ["image_too_large", "errorImageTooLarge"],
    ["upload_failed", "errorUploadFailed"],
    ["insert_failed", "errorInsertFailed"],
  ])("maps %s to the %s message key", (code, expectedKey) => {
    expect(mapCreateKudoErrorCode(code, identityT)).toBe(expectedKey);
  });

  it("calls the translator with the resolved key", () => {
    const calls: string[] = [];
    const t = (key: string) => {
      calls.push(key);
      return `translated:${key}`;
    };
    expect(mapCreateKudoErrorCode("insert_failed", t)).toBe("translated:errorInsertFailed");
    expect(calls).toEqual(["errorInsertFailed"]);
  });
});
