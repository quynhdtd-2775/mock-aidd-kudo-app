"use client";

// mm:I520:11647;520:9896 (mms_F_Frame 537) — optional image upload row:
// label, 80x80 thumbnails with remove "x", "+ Image" add button, "Tối đa 5".

import Image from "next/image";
import { useTranslations } from "next-intl";
import { FieldLabel } from "./field-label";
import { FieldErrorText } from "./field-error-text";
import { PlusIcon, CloseTinyIcon } from "./write-kudo-icons";
import { WRITE_KUDO_COLORS, MONTSERRAT } from "./write-kudo-tokens";
import { MAX_IMAGES, type UploadedImage } from "./write-kudo-mock-data";

export interface ImageUploadFieldProps {
  images: UploadedImage[];
  onAdd: () => void;
  onRemove: (id: string) => void;
  error?: string;
}

export function ImageUploadField({ images, onAdd, onRemove, error }: ImageUploadFieldProps) {
  const t = useTranslations("WriteKudo");
  const atMax = images.length >= MAX_IMAGES;

  return (
    <div className="flex w-full flex-col gap-1">
      <div className="flex w-full items-center gap-4">
        <FieldLabel text={t("imageLabel")} />
        <div className="flex flex-1 flex-nowrap items-center gap-4 overflow-x-auto">
          {images.map((image) => (
            <div
              key={image.id}
              className="relative h-20 w-20 shrink-0 overflow-hidden"
              style={{ border: `1px solid ${WRITE_KUDO_COLORS.border}`, borderRadius: 18, background: "#FFFFFF" }}
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes="80px"
                unoptimized={image.src.startsWith("blob:")}
                className="object-cover"
                style={{ border: `1px solid ${WRITE_KUDO_COLORS.imageThumbnailBorder}`, borderRadius: 4 }}
              />
              <button
                type="button"
                aria-label={t("imageRemoveAriaLabel", { alt: image.alt })}
                onClick={() => onRemove(image.id)}
                className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full"
                style={{ background: "#D4271D", color: "#FFFFFF" }}
              >
                <CloseTinyIcon className="h-[17px] w-[17px]" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={onAdd}
            disabled={atMax}
            aria-label={t("imageAddAriaLabel")}
            className="flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 transition-colors duration-200 hover:bg-[rgba(153,140,95,0.08)] disabled:cursor-not-allowed disabled:opacity-50"
            style={{ border: `1px solid ${WRITE_KUDO_COLORS.border}`, background: WRITE_KUDO_COLORS.fieldBackground }}
          >
            <PlusIcon className="h-6 w-6 shrink-0" style={{ color: WRITE_KUDO_COLORS.textSecondary }} />
            <span
              className="flex flex-col"
              style={{
                fontFamily: MONTSERRAT,
                fontWeight: 700,
                fontSize: 11,
                lineHeight: "16px",
                letterSpacing: "0.5px",
                color: WRITE_KUDO_COLORS.textSecondary,
              }}
            >
              <span>{t("imageAddLabel")}</span>
              <span>{t("imageMax", { max: MAX_IMAGES })}</span>
            </span>
          </button>
        </div>
      </div>
      <FieldErrorText message={error} />
    </div>
  );
}
