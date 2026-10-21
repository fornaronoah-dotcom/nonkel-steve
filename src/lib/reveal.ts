import type { CSSProperties } from "react";

/** Vertraging voor een `.reveal`-element, voor een trapsgewijze invoeg-animatie. */
export const delay = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;
