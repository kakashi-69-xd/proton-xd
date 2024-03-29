import { symbols as rust } from "../../../bindings/bindings.ts";
import * as lib from "../../../bindings/bindings.ts";
// import { CursorIcon } from '../types/window.ts';
import { ImageBuffer } from '../image/image.ts';
import { MinSize,SizeConstraints,WindowAttributes,MaxSize,Position,Size } from '../types/mod.ts';
import { Result,$resultSync } from "../../std/error/result/mod.ts";
import { getF64Touple, getI32Touple, getU32Touple } from "../read_ptr.ts";



export abstract class WindowTrait {
  public static readonly defaultPos={ x: 0,y: 0 };
  public static readonly defaultSize={ height: 0,width: 0 };
  
  protected abstract windowAttrs: WindowAttributes;
  public abstract get ptr(): bigint;

  private set _window_(window: WindowAttributes) {
    Object.assign(this.windowAttrs,window);
  }
  
  #getPos<T extends number|bigint>(f: (ptr: number|bigint)=> Deno.PointerValue,reader: (ptr: Deno.PointerValue)=> [T,T]) {
    return $resultSync(()=> {
      if(!this.ptr) return WindowTrait.defaultPos;

      const [x,y]=reader(f(this.ptr));
      return { x,y };
    });
  }


  public cursorPos(): Result<Position,Error> {
    return this.#getPos(rust.cursor_position,getF64Touple);
  }

  public async dragWindow() {
    this.ptr && await rust.drag_window(this.ptr);
  }

  public innerPosition(): Result<Position,Error> {
    return this.#getPos(rust.inner_position,getI32Touple);
  }

  public isClosable() {
    return this.ptr?rust.is_closable(this.ptr):this.windowAttrs.closable!;
  }

  public isDecorated() {
    return this.ptr?rust.is_decorated(this.ptr):this.windowAttrs.decorations!;
  }

  public isFocused() {
    return this.ptr?rust.is_focused(this.ptr):this.windowAttrs.focused!;
  }

  public isMaximizable() {
    return this.ptr?rust.is_maximizable(this.ptr):this.windowAttrs.maximizable!;
  }

  public isMaximized() {
    return this.ptr?rust.is_maximized(this.ptr):this.windowAttrs.maximized!;
  }

  public isMinimizable() {
    return this.ptr?rust.is_minimizable(this.ptr):this.windowAttrs.minimizable!;
  }

  public isMinimized() {
    return this.ptr?rust.is_minimized(this.ptr):this.windowAttrs.maximized!;
  }

  public isResizable() {
    return this.ptr?rust.is_resizable(this.ptr):this.windowAttrs.resizable!;
  }

  public isVisible() {
    return this.ptr?rust.is_visible(this.ptr):this.windowAttrs.visible!;
  }

  public position(): Result<Position,Error> {
    return this.#getPos(rust.outer_position,getI32Touple);
  }

  public size(): Size {
    if(!this.ptr) return WindowTrait.defaultSize;
    const [height,width]=getU32Touple(rust.outer_size(this.ptr));

    return { height,width };
  }

  public requestRedraw() {
    this.ptr && lib.request_redraw(this.ptr);
  }

  // public requestUserAttention(requestType: lib.AttentionType="Informational") {
  //   this.ptr && lib.request_user_attention(this.ptr,requestType);
  // }

  public scaleFactor() {
    return this.ptr?lib.scale_factor(this.ptr):0;
  }

  public theme() {
    return this.ptr?rust.theme(this.ptr)?"Dark":"Light":this.windowAttrs.theme!;
  }

  public title() {
    return this.ptr?lib.title(this.ptr):"untitled";
  }
  
  public setAlwaysOnTop(alwaysOnTop: boolean) {
    this.ptr?rust.set_always_on_top(this.ptr,alwaysOnTop):this.windowAttrs.alwaysOnTop=alwaysOnTop;
  }
  
  public setAlwaysOnBottom(alwaysOnBottom: boolean) {
    this.ptr?rust.set_always_on_bottom(this.ptr,alwaysOnBottom):this.windowAttrs.alwaysOnBottom=alwaysOnBottom;
  }
  
  public setClosable(closable: boolean) {
    this.ptr?rust.set_closable(this.ptr,closable):this.windowAttrs.closable=closable;
  }
  
  public setContentProtection(cotentProtection: boolean) {
    this.ptr?rust.set_content_protection(this.ptr,cotentProtection):this.windowAttrs.contentProtection=cotentProtection;
  }

  public setCursorGrab(grab: boolean) {
    this.ptr && rust.set_cursor_grab(this.ptr,grab);
  }

  // public setCursorIcon(icon: CursorIcon) {
  //   this.ptr && lib.set_cursor_icon(this.ptr,icon);
  // }
  
  public setCursorPosition(x: number,y: number) {
    this.ptr && rust.set_cursor_position(this.ptr,x,y);
  }

  public setCursorVisible(visible: boolean) {
    this.ptr && rust.set_cursor_visible(this.ptr,visible);
  }

  public setDecorations(decorations: boolean) {
    this.ptr?rust.set_decorations(this.ptr,decorations):this.windowAttrs.decorations=decorations;
  }

  public setFocus() {
    this.ptr?lib.set_focus(this.ptr):this.windowAttrs.focused=true;
  }

  public setIgnoreCursorEvents(ignore: boolean) {
    this.ptr && rust.set_ignore_cursor_events(this.ptr,ignore);
  }
  
  public setImePosition({x,y}: Position) {
    this.ptr && rust.set_ime_position(this.ptr,x,y);
  }
  
  public setInnerSize(size: Size) {
    this.ptr?rust.set_inner_size(this.ptr,size.height,size.width):this._window_.innerSize=size;
  }

  public setInnerSizeConstraints(size: SizeConstraints) {
    if(this.ptr)
      return rust.set_inner_size_constraints(this.ptr,size.minWidth,size.minHeight,size.maxWidth,size.maxHeight);
    
    this._window_=size;
  }

  public setMaxInnerSize(size: MaxSize) {
    if(this.ptr)
      return this.ptr && rust.set_max_inner_size(this.ptr,size.maxHeight,size.maxWidth);

    this._window_=size;
  }
  
  public setMaximizable(maximizable: boolean) {
    this.ptr?rust.set_maximizable(this.ptr,maximizable):this.windowAttrs.maximizable=maximizable;
  }

  public setMaximized(maximized: boolean) {
    this.ptr?rust.set_maximized(this.ptr,maximized):this.windowAttrs.maximized=maximized;
  }
  
  public setMinInnerSize(size: MinSize) {
    if(this.ptr)
      return rust.set_min_inner_size(this.ptr,size.minHeight,size.minWidth);
    
    this._window_=size;
  }
  
  public setMinimizable(minimizable: boolean) {
    this.ptr?rust.set_minimizable(this.ptr,minimizable):this.windowAttrs.minimizable=minimizable;
  }
  
  public setMinimized(minimized: boolean) {
    this.ptr && rust.set_minimized(this.ptr,minimized);
  }

  public setOuterPosition({ x,y }: Position) {
    this.ptr && rust.set_outer_position(this.ptr,x,y);
  }

  public setResizable(resizable: boolean) {
    this.ptr?rust.set_resizable(this.ptr,resizable):this.windowAttrs.resizable=resizable;
  }
  
  public setTitle(title: string) {
    this.ptr?lib.set_title(this.ptr,title):this.windowAttrs.title=title;
  }
  
  public setVisible(visible: boolean) {
    this.ptr?rust.set_visible(this.ptr,visible):this.windowAttrs.visible=visible;
  }

  
  public setVisibleOnAllWorkspaces(visible: boolean) {
    this.ptr?rust.set_visible_on_all_workspaces(this.ptr,visible):this.windowAttrs.visibleOnAllWorkspaces=visible;
  }

  public setWindowIcon(icon: ImageBuffer) {
    this.ptr?lib.set_window_icon(this.ptr,icon.height,icon.width,icon.bytes):this.windowAttrs.windowIcon=icon;
  }
}


