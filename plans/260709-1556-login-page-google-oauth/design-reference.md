# Design Reference — Login frame (Figma node 662:14387, 1440×1024)

Source: Figma file 9ypp4enmFmdK3YAFJLIu6C, page "Website", frame "Login".
MoMorph URL (server down 2026-07-09): https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/GzbNeVGJHz

## Assets (Figma-hosted, expire ~2026-07-16 — download to public/login/ FIRST)

| Suggested filename | URL | Used for |
|---|---|---|
| keyvisual-background.png | https://www.figma.com/api/mcp/asset/b46ebfd4-df66-47aa-b7f8-eeb7167e767b | full-page background artwork |
| root-further-logo.png | https://www.figma.com/api/mcp/asset/8fed5a2e-da0c-409c-8ae6-8a0921c29261 | "ROOT FURTHER" hero logo, 451×200 |
| saa-logo.png | https://www.figma.com/api/mcp/asset/11e14dc7-c7eb-46fd-a3eb-e82255489596 | header logo, 52×48 |
| google-icon.png | https://www.figma.com/api/mcp/asset/bd30f45f-51d2-42c0-88d7-be7fc62271f5 | 24×24 icon inside login button |
| vn-flag-icon.png | https://www.figma.com/api/mcp/asset/1e92165b-b42b-4485-a3d8-b94bff1d002a | 24×24 VN flag in language button |
| chevron-down-icon.png | https://www.figma.com/api/mcp/asset/73f2bfb9-4542-41d1-b81b-4df422dfe582 | 24×24 dropdown chevron |

Download with: `curl -L -o public/login/<name> "<url>"` (verify each file is non-empty PNG).

## Design tokens

- Background: `#00101a` (details/background)
- Primary accent (button bg): `#ffea9e` (details/text-primary-1)
- Button text: `#00101a` (details/text-primary-2)
- Text on dark: `white` (details/text-secondary-1)
- Divider: `#2e3940`
- Fonts: Montserrat (Regular 400 / Medium 500 / Bold 700), Montserrat Alternates (Bold 700, footer only). Load via `next/font/google`, scoped to the login page (do NOT touch app/layout.tsx Geist setup).

## Figma reference code (React+Tailwind, verbatim from get_design_context)

Adapt to project stack: Tailwind v4, Next.js App Router, kebab-case files, <200 lines/file.
Replace figma asset URLs with local /login/*.png paths. Make layout responsive-safe
(design is fixed 1440×1024; content must not break at other viewports — page body must not scroll horizontally).

```tsx
export default function Login() {
  return (
    <div className="bg-[#00101a] relative size-full" data-name="Login">
      {/* mms_C_Keyvisual: background image 1441×1022 at top:2, inner img scaled h-133.37% left--30.53% top--21.33% w-159.76% */}
      {/* Cover: vertical gradient bg-gradient-to-t from-[#00101a] from-[22.482%] to-[rgba(0,19,32,0)] to-[51.738%], h-1093 top-138 */}
      {/* Side gradient: bg-gradient-to-r from-[#00101a] via-[#00101a] via-[25.407%] to-[rgba(0,16,26,0)], full 1442×1024 centered */}

      {/* mms_B_Bìa: content column, w-1440 h-845 top-88 centered, px-[144px] py-[96px] */}
      {/*   inner column: gap-[80px], vertically centered */}
      {/*   mms_B.1_Key Visual: ROOT FURTHER logo image 451×200 */}
      {/*   text block: flex-col gap-[24px] pl-[16px] */}
      {/*     tagline: Montserrat Bold 20px, leading-[40px], tracking-[0.5px], white, w-[480px]: */}
      {/*       "Bắt đầu hành trình của bạn cùng SAA 2025." / "Đăng nhập để khám phá!" */}
      {/*     mms_B.3_Login button: bg-[#ffea9e] rounded-[8px] px-[24px] py-[16px] gap-[8px] */}
      {/*       label: Montserrat Bold 22px leading-[28px] text-[#00101a]: "LOGIN With Google " */}
      {/*       icon: google 24×24 (after the label) */}

      {/* mms_D_Footer: bottom, border-t border-[#2e3940], py-[40px] px-[90px], centered */}
      {/*   "Bản quyền thuộc về Sun* © 2025" — Montserrat Alternates Bold 16px leading-[24px] white */}

      {/* mms_A_Header: top, bg-[rgba(11,15,18,0.8)] px-[144px] py-[12px], justify-between */}
      {/*   left: SAA logo 52×48 */}
      {/*   right mms_A.2_Language: button w-[108px] p-[16px] rounded-[4px]: VN flag 24 + "VN" Montserrat Bold 16 white + chevron 24 */}
    </div>
  );
}
```

Full verbatim class strings from Figma (use these exact values when building):
- Header bar: `absolute bg-[rgba(11,15,18,0.8)] flex items-center justify-between left-0 px-[144px] py-[12px] top-0 w-full`
- Tagline text: `font-bold text-[20px] tracking-[0.5px] leading-[40px] text-white w-[480px]` (Montserrat)
- Button: `bg-[#ffea9e] flex gap-[8px] items-center px-[24px] py-[16px] rounded-[8px]`; label `font-bold text-[22px] leading-[28px] text-[#00101a]`, text: `LOGIN With Google ` then 24px Google icon
- Footer: `border-t border-[#2e3940] py-[40px] text-center`, text `font-bold text-[16px] leading-[24px] text-white` (Montserrat Alternates)
- Background: keyvisual image fills viewport; dark gradient overlay bottom-up from #00101a; second gradient left-to-right from #00101a via 25.4% to transparent (text sits on the darkened left side)

## Screen behavior (integration contract with backend)

- The Google button is the ONLY interactive element: `<form action={loginWithGoogle}>` with `loginWithGoogle` imported from `./actions` (server action, exists/being built by Track B — import it; do not implement it).
- Page reads `searchParams` `error`: when present, render "Đăng nhập thất bại. Vui lòng thử lại." in Montserrat, small, near the button (design has no error state — keep it visually consistent: white text on dark, non-intrusive).
- Language dropdown + header logo: static, non-interactive (clarified).
- No email/password form (clarified — design is authoritative).
