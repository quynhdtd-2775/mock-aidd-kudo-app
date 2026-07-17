"use client";

// Client boundary wrapping the "ghi nhận" pill (mm:2940:13449) — holds the
// Viết Kudo modal's open state so function-buttons.tsx can stay a server
// component. Renders PillActionButton with an onClick, mounting
// WriteKudoModal only while open.

import { useState } from "react";
import { PillActionButton } from "./secondary-buttons";
import { WriteKudoModal } from "@/components/kudos/write-kudo/write-kudo-modal";

export interface WriteKudoLauncherProps {
  icon: React.ReactNode;
  label: string;
  className?: string;
}

export function WriteKudoLauncher({ icon, label, className }: WriteKudoLauncherProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <PillActionButton icon={icon} label={label} className={className} onClick={() => setIsOpen(true)} />
      <WriteKudoModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
