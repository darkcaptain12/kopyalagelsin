declare module "react-pageflip" {
  import { Component, ReactNode, CSSProperties } from "react";

  interface HTMLFlipBookProps {
    width: number;
    height: number;
    size?: "fixed" | "stretch";
    minWidth?: number;
    maxWidth?: number;
    minHeight?: number;
    maxHeight?: number;
    drawShadow?: boolean;
    flippingTime?: number;
    usePortrait?: boolean;
    startZIndex?: number;
    autoSize?: boolean;
    maxShadowOpacity?: number;
    showCover?: boolean;
    mobileScrollSupport?: boolean;
    clickEventForward?: boolean;
    useMouseEvents?: boolean;
    swipeDistance?: number;
    showPageCorners?: boolean;
    disableFlipByClick?: boolean;
    className?: string;
    style?: CSSProperties;
    startPage?: number;
    children?: ReactNode;
    onFlip?: (e: { data: number }) => void;
    onChangeOrientation?: (e: { data: string }) => void;
    onChangeState?: (e: { data: string }) => void;
    onInit?: (e: { data: object }) => void;
    onUpdate?: (e: { data: object }) => void;
    ref?: any;
  }

  export default class HTMLFlipBook extends Component<HTMLFlipBookProps> {
    pageFlip(): {
      flipNext: () => void;
      flipPrev: () => void;
      flip: (page: number) => void;
      getCurrentPageIndex: () => number;
      getPageCount: () => number;
    };
  }
}
