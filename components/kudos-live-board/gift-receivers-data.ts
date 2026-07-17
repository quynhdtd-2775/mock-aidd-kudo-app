// mm:2940:13511 "Frame 544" — mock data for the 5 rows under
// "D.3_10 SUNNER nhận quà" (D.3.2 .. D.3.6). Name and notification text are
// copied verbatim from the Figma instances (2940:13516 .. 2940:13520), which
// all share the same content in this design.
export interface GiftReceiverData {
  id: string;
  name: string;
  notification: string;
}

export const GIFT_RECEIVERS: GiftReceiverData[] = [
  { id: "2940:13516", name: "Huỳnh Dương Xuân", notification: "Nhận được 1 áo phông SAA" },
  { id: "2940:13517", name: "Huỳnh Dương Xuân", notification: "Nhận được 1 áo phông SAA" },
  { id: "2940:13518", name: "Huỳnh Dương Xuân", notification: "Nhận được 1 áo phông SAA" },
  { id: "2940:13519", name: "Huỳnh Dương Xuân", notification: "Nhận được 1 áo phông SAA" },
  { id: "2940:13520", name: "Huỳnh Dương Xuân", notification: "Nhận được 1 áo phông SAA" },
];
