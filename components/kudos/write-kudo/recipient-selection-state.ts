// Pure state transitions for the recipient selector's { query, selectedId }
// state (MAJOR-1 fix). Kept in its own module, free of any "use client"
// hook or server-action import, so this logic is directly unit-testable
// without pulling in the server-action module graph.
//
// selectedId is only ever set by an explicit selectRecipient(option) call —
// a dropdown click — never re-resolved from typed text. profiles.display_name
// has no uniqueness constraint, so two colleagues sharing a display name
// must never collapse to "whichever id matches the text first".

import type { RecipientOption } from "./write-kudo-mock-data";

export interface RecipientSelectionState {
  query: string;
  selectedId: string | null;
}

export const EMPTY_RECIPIENT_SELECTION: RecipientSelectionState = { query: "", selectedId: null };

/**
 * Pure state transition for free-text typing — always invalidates any
 * previously selected id, since the text no longer necessarily matches it.
 */
export function applyQueryChange(query: string): RecipientSelectionState {
  return { query, selectedId: null };
}

/**
 * Pure state transition for an explicit dropdown pick — stores the option's
 * id alongside its display name directly, with no name-matching involved.
 */
export function applySelection(option: RecipientOption): RecipientSelectionState {
  return { query: option.name, selectedId: option.id };
}
