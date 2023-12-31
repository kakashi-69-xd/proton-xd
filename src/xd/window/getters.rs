use crate::{
  cast,
  MonitorData,
  AttentionType,
  FullScreen,
  exception::throw,
};

use deno_bindgen::{
  deno_bindgen,
  serde_json::{
    to_string,
    from_str
  }
};

use wry::application::dpi::{
  PhysicalPosition,
  PhysicalSize
};

use std::{
  collections::LinkedList,
  fmt::Debug,
  mem::ManuallyDrop
};


//TODO: optimized data usage using Box<str>
//TODO: FFI safe linked_list
#[deno_bindgen]
pub fn available_monitors(ptr: usize)-> String {
  unsafe {
    let mut monitors=LinkedList::<MonitorData>::new();

    for monitor in (*cast(ptr)).available_monitors() {
      monitors.push_back(MonitorData::from(monitor))
    }

    to_string(&monitors).unwrap_or_default()
  }
}


// todo ----------------------------------
#[deno_bindgen]
pub fn current_monitor(ptr: usize)-> String {
  unsafe {
    let monitor: MonitorData=(*cast(ptr)).current_monitor().unwrap().into();
    to_string(&monitor).unwrap_or_default()
  }
}


#[deno_bindgen]
pub fn cursor_position(ptr: usize)-> usize {
  unsafe {
    (*cast(ptr)).cursor_position().to_ptr()
  }
}

#[no_mangle]
pub unsafe extern "C" fn drag_window(ptr: usize) {
  (*cast(ptr)).drag_window().unwrap_or(())
}

#[deno_bindgen]
pub fn fullscreen(ptr: usize)-> String {
  unsafe {
    let fullscreen: FullScreen=(*cast(ptr)).fullscreen().into();
    to_string(&fullscreen).unwrap()
  }
}

#[deno_bindgen]
pub fn inner_position(ptr: usize)-> usize {
  unsafe {
    (*cast(ptr)).inner_position().unwrap_or_default().to_ptr()
  }
}

#[no_mangle]
pub unsafe extern "C" fn is_closable(ptr: usize)-> bool {
  (*cast(ptr)).is_closable()
}

#[no_mangle]
pub unsafe extern "C" fn is_decorated(ptr: usize)-> bool {
  (*cast(ptr)).is_decorated()
}

#[no_mangle]
pub unsafe extern "C" fn is_focused(ptr: usize)-> bool {
  (*cast(ptr)).is_focused()
}

#[no_mangle]
pub unsafe extern "C" fn is_maximizable(ptr: usize)-> bool {
  (*cast(ptr)).is_maximizable()
}

#[no_mangle]
pub unsafe extern "C" fn is_maximized(ptr: usize)-> bool {
  (*cast(ptr)).is_maximized()
}

#[no_mangle]
pub unsafe extern "C" fn is_minimizable(ptr: usize)-> bool {
  (*cast(ptr)).is_minimizable()
}

#[no_mangle]
pub unsafe extern "C" fn is_minimized(ptr: usize)-> bool {
  (*cast(ptr)).is_minimized()
}

#[no_mangle]
pub unsafe extern "C" fn is_resizable(ptr: usize)-> bool {
  (*cast(ptr)).is_resizable()
}

#[no_mangle]
pub unsafe extern "C" fn is_visible(ptr: usize)-> bool {
  (*cast(ptr)).is_visible()
}


//todo-----------------------------------------------------------------------------------------
#[deno_bindgen]
pub fn monitor_from_point(ptr: usize,x: f64,y: f64)-> String {
  unsafe {
    let monitor=(*cast(ptr)).monitor_from_point(x,y).unwrap();
    to_string(&MonitorData::from(monitor)).unwrap_or_default()
  }
}


#[deno_bindgen]
pub fn outer_position(ptr: usize)-> usize {
  unsafe {
    (*cast(ptr)).outer_position().unwrap_or_default().to_ptr()
  }
}

#[deno_bindgen]
pub fn outer_size(ptr: usize)-> usize {
  unsafe {
    (*cast(ptr)).outer_size().to_ptr()
  }
}

// todo ---------------------------------------------------
#[deno_bindgen]
pub fn primary_monitor(ptr: usize)-> String {
  unsafe {
    let monitor: MonitorData=(*cast(ptr)).primary_monitor().unwrap().into();
    to_string(&monitor).unwrap_or_default()
  }
}

#[deno_bindgen]
pub fn request_redraw(ptr: usize) {
  unsafe {
    (*cast(ptr)).request_redraw();
  }
}

#[deno_bindgen]
pub fn request_user_attention(ptr: usize,request_type: &str) {
  unsafe {
    let request_type: AttentionType=from_str(request_type).unwrap_or(AttentionType::Informational);
    (*cast(ptr)).request_user_attention(Some(request_type.into()));
  }
}

#[deno_bindgen]
pub fn scale_factor(ptr: usize)-> f64 {
  unsafe {
    (*cast(ptr)).scale_factor()
  }
}

#[no_mangle]
pub unsafe extern "C" fn theme(ptr: usize)-> bool {
  match (*cast(ptr)).theme() {
    wry::application::window::Theme::Light=> false,
    _=> true
  }
}

#[deno_bindgen]
pub fn title(ptr: usize)-> String {
  unsafe {
    (*cast(ptr)).title()
  }
}



trait ToPtr {
  fn to_ptr(self)-> usize;
}

impl<T> ToPtr for PhysicalPosition<T> {
  fn to_ptr(self)-> usize {
    &ManuallyDrop::new(self) as *const _ as usize
  }
}

impl<T: ToPtr,E: Debug> ToPtr for Result<T,E> {
  fn to_ptr(self)-> usize {
    match self {
      Err(err)=> throw(&format!("{err:#?}")),
      Ok(val)=> val.to_ptr()
    }
  }
}

impl<T> ToPtr for PhysicalSize<T> {
  fn to_ptr(self)-> usize {
    &ManuallyDrop::new(self) as *const _ as usize
  }
}


