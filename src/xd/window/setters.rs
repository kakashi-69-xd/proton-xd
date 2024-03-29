
use xd_macro::method;
use deno_bindgen::deno_bindgen;
use crate::{
  cursor_icon,
  to_constraints,
  exception::Exception
};

use wry::application::{
  dpi::{
    PhysicalPosition,
    PhysicalSize
  },
  window::{
    Icon,
    Window,
    CursorIcon
  }
};


#[method]
pub extern "C" fn set_always_on_bottom(this: &Window,always_on_bottom: bool) {
  this.set_always_on_bottom(always_on_bottom)
}

#[method]
pub extern "C" fn set_always_on_top(this: &Window,always_on_top: bool) {
  this.set_always_on_top(always_on_top)
}


#[method]
pub extern "C" fn set_closable(this: &Window,closable: bool) {
  this.set_closable(closable)
}

#[method]
pub extern "C" fn set_content_protection(this: &Window,enabled: bool) {
  this.set_content_protection(enabled)
}

#[method]
pub extern "C" fn set_cursor_grab(this: &Window,grab: bool) {
  this.set_cursor_grab(grab).unwrap_or_throw()
}

#[method]
pub fn set_cursor_icon(this: &Window,cursor: u8) {
  this.set_cursor_icon(cursor_icon! { cursor })
}

#[method]
pub fn set_cursor_position(this: &Window,x: i32,y: i32) {
  this.set_cursor_position(PhysicalPosition::new(x,y)).unwrap_or_throw()
}

#[method]
pub extern "C" fn set_cursor_visible(this: &Window,visible: bool) {
  this.set_cursor_visible(visible);
}

#[method]
pub extern "C" fn set_decorations(this: &Window,decorations: bool) {
  this.set_decorations(decorations)
}

#[method]
pub fn set_focus(this: &Window) {
  this.set_focus()
}

#[method]
// TODO: fullscreen
pub fn set_fullscreen(_this: &Window,_fullscreen: &str)-> String {
  unimplemented!()
}

#[method]
pub extern "C" fn set_ignore_cursor_events(this: &Window,ignore: bool) {
  this.set_ignore_cursor_events(ignore).unwrap_or_throw()
}

#[method]
pub fn set_ime_position(this: &Window,x: i32,y: i32) {
  this.set_ime_position(PhysicalPosition::new(x,y))
}

#[method]
pub fn set_inner_size(this: &Window,height: u32,width: u32) {
  this.set_inner_size(PhysicalSize::new(width,height))
}

#[method]
pub fn set_inner_size_constraints(this: &Window,min_height: i32,min_width: i32,max_height: i32,max_width: i32) {
  this.set_inner_size_constraints(
    to_constraints!(
      Some(min_width),
      Some(min_height),
      Some(max_width),
      Some(max_height)
    )
  );
}

#[method]
pub fn set_max_inner_size(this: &Window,height: u32,width: u32) {
  this.set_max_inner_size(Some(PhysicalSize::new(width,height)))
}

#[method]
pub extern "C" fn set_maximizable(this: &Window,maximizable: bool) {
  this.set_maximizable(maximizable)
}

#[method]
pub extern "C" fn set_maximized(this: &Window,maximized: bool) {
  this.set_maximized(maximized)
}

#[method]
pub fn set_min_inner_size(this: &Window,height: u32,width: u32) {
  this.set_min_inner_size(Some(PhysicalSize::new(width,height)))
}

#[method]
pub extern "C" fn set_minimizable(this: &Window,minimizable: bool) {
  this.set_minimizable(minimizable)
}

#[method]
pub extern "C" fn set_minimized(this: &Window,minimized: bool) {
  this.set_minimized(minimized)
}

#[method]
pub fn set_outer_position(this: &Window,x: i32,y: i32) {
  this.set_outer_position(PhysicalPosition::new(x,y))
}

#[method]
pub fn set_progress_bar(_this: &Window)-> String {
  unimplemented!()
}

#[method]
pub extern "C" fn set_resizable(this: &Window,resizable: bool) {
  this.set_resizable(resizable)
}

#[method]
pub fn set_title(this: &Window,title: &str) {
  this.set_title(title)
}

#[method]
pub extern "C" fn set_visible(this: &Window,visible: bool) {
  this.set_visible(visible)
}

#[method]
pub extern "C" fn set_visible_on_all_workspaces(this: &Window,visible: bool) {
  this.set_visible_on_all_workspaces(visible)
}

#[method(non_blocking)]
pub fn set_window_icon(this: &Window,height: u32,width: u32,bytes: &[u8]) {
  this.set_window_icon(Icon::from_rgba(bytes.to_vec(),width,height).ok())
}


