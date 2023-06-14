import * as xd from "./xd.ts";
import * as sc from "./screencapture.ts";


namespace ProtonXD {
  export const XD=xd.default;
  export const Theme=xd.Theme;
  
  export const ScreenCapturer=sc.default;
  export const Image=sc.Image;
  export type ImageBuffer=sc.ImageBuffer;
  
}


export default ProtonXD;