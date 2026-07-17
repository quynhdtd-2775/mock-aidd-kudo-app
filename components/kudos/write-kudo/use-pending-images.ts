"use client";

// Owns the image-picker state: pending Files + their object-URL previews,
// client-side validation, and cleanup of object URLs on unmount.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { validateClientImages, CLIENT_MAX_IMAGES } from "./validate-client-image";
import type { UploadedImage } from "./write-kudo-mock-data";

interface PendingImage {
  id: string;
  file: File;
  previewUrl: string;
}

export function usePendingImages() {
  const t = useTranslations("WriteKudo");
  const [pendingImages, setPendingImages] = useState<PendingImage[]>([]);
  const [imageClientError, setImageClientError] = useState<string | undefined>(undefined);

  // Revoke every pending preview's object URL on unmount. Reads from a ref
  // (kept in sync below) rather than `pendingImages` directly, so the
  // cleanup always sees the latest list instead of the empty initial one.
  const pendingImagesRef = useRef<PendingImage[]>([]);
  useEffect(() => {
    pendingImagesRef.current = pendingImages;
  }, [pendingImages]);
  useEffect(() => {
    return () => {
      pendingImagesRef.current.forEach((image) => URL.revokeObjectURL(image.previewUrl));
    };
  }, []);

  const images: UploadedImage[] = useMemo(
    () => pendingImages.map((p) => ({ id: p.id, src: p.previewUrl, alt: p.file.name })),
    [pendingImages],
  );

  const handleFilesSelected = useCallback(
    (fileList: FileList | null) => {
      if (!fileList || fileList.length === 0) return;
      const { accepted, error } = validateClientImages(pendingImages.length, Array.from(fileList), CLIENT_MAX_IMAGES);
      setImageClientError(
        error === "too_many_images"
          ? t("errorTooManyImages")
          : error === "invalid_image_type"
            ? t("errorInvalidImageType")
            : error === "image_too_large"
              ? t("errorImageTooLarge")
              : undefined,
      );
      if (accepted.length === 0) return;
      setPendingImages((prev) => [
        ...prev,
        ...accepted.map((file) => ({ id: crypto.randomUUID(), file, previewUrl: URL.createObjectURL(file) })),
      ]);
    },
    [pendingImages.length, t],
  );

  const handleRemoveImage = useCallback((id: string) => {
    setPendingImages((prev) => {
      const removed = prev.find((image) => image.id === id);
      if (removed) URL.revokeObjectURL(removed.previewUrl);
      return prev.filter((image) => image.id !== id);
    });
  }, []);

  const files = useMemo(() => pendingImages.map((p) => p.file), [pendingImages]);

  return { images, files, handleFilesSelected, handleRemoveImage, imageClientError };
}
