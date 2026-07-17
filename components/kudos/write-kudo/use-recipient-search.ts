"use client";

// Debounced recipient autocomplete — queries searchProfilesAction and holds
// an explicit { query, selectedId } selection state. `selectedId` is only
// ever set by an explicit `selectRecipient(option)` call (a dropdown click),
// never re-resolved from typed text — two profiles sharing a display name
// (profiles.display_name has no uniqueness constraint) could otherwise
// silently resolve to whichever one happened to match first. Typing after a
// selection always clears the previous id. The pure state transitions live
// in recipient-selection-state.ts so they're unit-testable without pulling
// in the server-action module graph.

import { useEffect, useState } from "react";
import { searchProfilesAction } from "@/app/kudos-live-board/actions";
import { useDebouncedValue } from "./use-debounced-value";
import {
  applyQueryChange,
  applySelection,
  EMPTY_RECIPIENT_SELECTION,
  type RecipientSelectionState,
} from "./recipient-selection-state";
import type { RecipientOption } from "./write-kudo-mock-data";

export function useRecipientSearch() {
  const [selection, setSelection] = useState<RecipientSelectionState>(EMPTY_RECIPIENT_SELECTION);
  const [recipientOptions, setRecipientOptions] = useState<RecipientOption[]>([]);
  const debouncedQuery = useDebouncedValue(selection.query, 300);

  useEffect(() => {
    let cancelled = false;
    // searchProfiles resolves to [] for an empty/whitespace query, so this is
    // safe to call unconditionally and avoids a synchronous setState-in-effect.
    searchProfilesAction(debouncedQuery).then((results) => {
      if (cancelled) return;
      setRecipientOptions(results.map((r) => ({ id: r.id, name: r.displayName })));
    });
    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

  return {
    recipientQuery: selection.query,
    setRecipientQuery: (query: string) => setSelection(applyQueryChange(query)),
    selectRecipient: (option: RecipientOption) => setSelection(applySelection(option)),
    recipientOptions,
    selectedReceiverId: selection.selectedId,
  };
}
