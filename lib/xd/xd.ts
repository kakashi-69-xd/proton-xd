import * as lib from "../../bindings/bindings.ts";
import { defaultWindowAttrs as dwa,defaultWebViewAttrs as dweba,confirmDefaultVal, IterObj } from "./default.ts";
import { WebViewAttributes,Content,WindowAttributes,toContent } from "./types.ts";


export class XD {
  private readonly content: Content;
  private readonly windowAttrs: WindowAttributes;
  private readonly webviewAttrs: WebViewAttributes;

  /**
   * @param {Content} content defines the initial content of the webview
   * @param {WindowAttributes} windowAttrs defined the window's properties
   * @param {WebViewAttributes} webviewAttrs defines the webview's propoerties
   */
  constructor(content: Content,windowAttrs: WindowAttributes={},webviewAttrs: WebViewAttributes={}) {
    this.content=content;
    this.windowAttrs=windowAttrs;
    this.webviewAttrs=webviewAttrs;
  }

  /**
   * @param {WindowAttributes} window
   * updates the properties of window..
   * doesn't affect its other properties
   */
  public set window(window: WindowAttributes) {
    for(const key in window) this.window[key]=window[key];
  }
  /**
   * @returns {WindowAttributes}
   * returns a reference to its window
   */
  public get window(): WindowAttributes {
    return this.windowAttrs;
  }


  /**
   * @param {WebViewAttributes} webview
   * updates the properties of webview..
   * doesn't affect its other properties
   */
  public set webview(webview: WebViewAttributes) {
    for(const key in webview) this.webview[key]=webview[key];
  }
  /**
   * @returns {WebViewAttributes}
   * returns a reference to its webview
   */
  public get webview(): WebViewAttributes {
    return this.webviewAttrs;
  }
  

  /**
   * @description Initializes the webview..
   * @description updating window or webview after initialization doesn't affect them
   */
  public init() {
    lib.init(
      JSON.stringify(confirmDefaultVal(this.windowAttrs as IterObj,dwa)),
      JSON.stringify(confirmDefaultVal(this.webviewAttrs as IterObj,dweba)),
      toContent(this.content)
    );
  }
  
  public static instantiate(content: Content,windowAttrs: WindowAttributes={},webviewAttrs: WebViewAttributes={}) {
    new XD(content,windowAttrs,webviewAttrs).init();
  }





}

export type WindowProperty=keyof WindowAttributes;
export type WebViewProperty=keyof WebViewAttributes;

export function writeToClipboard(str: string){
  return lib.write_to_clipboard(str);
}
export function readClipboard() {
  return lib.read_clipboard();
}
