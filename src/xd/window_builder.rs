use deno_bindgen::deno_bindgen;

use wry::application::{
  event_loop::EventLoop,
  window::{
    Window,
    WindowBuilder,
    Theme as theme,
    Icon,
    WindowAttributes,
    WindowSizeConstraints,
  },
  dpi::{
    PhysicalSize,
    Size as size,
    PixelUnit,
    PhysicalPixel,
    Position as position,
    PhysicalPosition,
  },
  error::OsError,
};


#[deno_bindgen]
pub struct Size {
  pub height: u32,
  pub width: u32
}

impl Into<size> for Size {
  fn into(self)-> size {
    size::Physical(PhysicalSize::new(self.width,self.height))
  }
}

impl From<PhysicalSize<u32>> for Size {
  fn from(value: PhysicalSize<u32>)-> Self {
    let PhysicalSize { width, height }=value;
    Self {
      height,
      width
    }
  }
}

#[deno_bindgen]
pub enum Theme {
  Light,
  Dark,
}

impl Into<theme> for Theme {
  fn into(self)-> theme {
    match self {
      Self::Light=> theme::Light,
      Self::Dark=> theme::Dark,
    }
  }
}


#[deno_bindgen]
pub struct Position {
  pub x: i32,
  pub y: i32
}

impl From<PhysicalPosition<i32>> for Position {
  fn from(PhysicalPosition { x,y }: PhysicalPosition<i32>)-> Self {
    Self { x,y }
  }
}

#[deno_bindgen]
#[derive(Default)]
pub struct Img {
  pub bytes: Vec<u8>,
  pub height: u32,
  pub width: u32
}



#[deno_bindgen]
#[serde(rename_all = "camelCase")]
pub struct WindowAttrs {
  inner_size: Option<Size>,
  min_height: Option<i32>,
  max_height: Option<i32>,
  min_width: Option<i32>,
  max_width: Option<i32>,
  resizable: bool,
  minimizable: bool,
  maximizable: bool,
  closable: bool,
  title: String,
  maximized: bool,
  visible: bool,
  transparent: bool,
  decorations: bool,
  always_on_top: bool,
  always_on_bottom: bool,
  window_icon: Option<Img>,
  theme: Theme,
  focused: bool,
  content_protection: bool,
  visible_on_all_workspaces: bool,
  position: Option<Position>,
}


impl WindowAttrs {

  pub fn build(self,event_loop: &EventLoop<()>)-> Result<Window,OsError> {
    let WindowAttrs {
      always_on_bottom,
      always_on_top,
      closable,
      content_protection,
      decorations,
      focused,
      inner_size,
      max_height,
      max_width,
      min_height,
      min_width,
      maximizable,
      maximized,
      minimizable,
      theme,
      resizable,
      title,
      transparent,
      visible,
      visible_on_all_workspaces,
      position,
      window_icon
    }=self;

    let window=WindowAttributes {
      always_on_bottom,
      always_on_top,
      closable,
      content_protection,
      decorations,
      focused,
      maximizable,
      maximized,
      minimizable,
      resizable,
      title,
      transparent,
      visible,
      preferred_theme: Some(theme.into()),
      window_icon: to_icon(window_icon),
      visible_on_all_workspaces,
      inner_size: to_size(inner_size),
      inner_size_constraints: to_constraints(min_width,min_height,max_width,max_height),
      position: to_position(position),
      fullscreen: None
    };

    let mut window_builder=WindowBuilder::new();
    window_builder.window=window;

    window_builder.build(&event_loop)
  }
}


fn to_size(size: Option<Size>)-> Option<size> {
  Some(size?.into())
}

pub fn to_constraints(min_width: Option<i32>,min_height: Option<i32>,max_width: Option<i32>,max_height: Option<i32>)-> WindowSizeConstraints {
  let to_pixel=|s: Option<i32>| Some(PixelUnit::Physical(PhysicalPixel::new(s?)));
  
  WindowSizeConstraints::new(to_pixel(min_width),to_pixel(min_height),to_pixel(max_width),to_pixel(max_height))
}

fn to_position(pos: Option<Position>)-> Option<position> {
  let Position { x, y }=pos?;
  Some(position::Physical(
    wry::application::dpi::PhysicalPosition { x,y }
  ))
}

fn to_icon(icon: Option<Img>)-> Option<Icon> {
  let Img { height,width,bytes }=icon?;
  Icon::from_rgba(bytes,width,height).ok()
}
