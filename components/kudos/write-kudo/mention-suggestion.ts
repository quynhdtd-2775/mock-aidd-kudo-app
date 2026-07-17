"use client";

// Tiptap suggestion config for the "@" mention trigger — queries
// searchProfilesAction (Track B) and renders MentionList as a fixed-position
// popup positioned off the plugin's reported caret rect.

import { ReactRenderer } from "@tiptap/react";
import type { SuggestionOptions } from "@tiptap/suggestion";
import { searchProfilesAction } from "@/app/kudos-live-board/actions";
import type { ProfileSuggestion } from "@/lib/kudos/kudos-types";
import { MentionList, type MentionListProps, type MentionListRef } from "./mention-list";

const MAX_RESULTS = 8;

function positionPopup(element: HTMLElement, rect: DOMRect | null) {
  if (!rect) return;
  element.style.position = "fixed";
  element.style.left = `${rect.left}px`;
  element.style.top = `${rect.bottom + 4}px`;
  element.style.zIndex = "60";
}

export function createMentionSuggestion(
  noResultsLabel: string,
): Omit<SuggestionOptions<ProfileSuggestion>, "editor"> {
  return {
    char: "@",
    items: async ({ query }) => {
      if (!query.trim()) return [];
      const results = await searchProfilesAction(query);
      return results.slice(0, MAX_RESULTS);
    },
    render: () => {
      let component: ReactRenderer<MentionListRef, MentionListProps> | null = null;

      return {
        onStart: (props) => {
          const renderer = new ReactRenderer(MentionList, {
            props: { items: props.items, command: props.command, noResultsLabel },
            editor: props.editor,
          });
          component = renderer;
          document.body.appendChild(renderer.element as HTMLElement);
          positionPopup(renderer.element as HTMLElement, props.clientRect?.() ?? null);
        },
        onUpdate: (props) => {
          component?.updateProps({ items: props.items, command: props.command, noResultsLabel });
          positionPopup(component?.element as HTMLElement, props.clientRect?.() ?? null);
        },
        onKeyDown: (props) => {
          if (props.event.key === "Escape") {
            component?.element.remove();
            component?.destroy();
            return true;
          }
          return component?.ref?.onKeyDown(props) ?? false;
        },
        onExit: () => {
          component?.element.remove();
          component?.destroy();
        },
      };
    },
  };
}
