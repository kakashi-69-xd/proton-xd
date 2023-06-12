use wry::{
    application::{
        event::{
            Event,
        StartCause,
        WindowEvent
    },
        event_loop::{
            ControlFlow,
            EventLoop
        },
        window::{WindowBuilder,Theme},
        dpi::PhysicalSize,
        clipboard::Clipboard,
    },
    webview::WebViewBuilder
};

use deno_bindgen::deno_bindgen;

#[deno_bindgen]
pub fn init(title: &str,url: &str,width: u16,height: u16,_icon: &str,theme: u8) {
    let get_theme=move || {
        Some(match theme {
            0=> Theme::Light,
            _=> Theme::Dark
        })
    };

    let event_loop=EventLoop::new();
    let window=WindowBuilder::new()
    .with_title(title)
    .with_inner_size(PhysicalSize::new(width,height))
    .with_theme(get_theme())
    .build(&event_loop).unwrap();

    let _webview=WebViewBuilder::new(window).unwrap()
    .with_url(url).unwrap()
    .build().unwrap();

    event_loop.run(move |event, _, control_flow| {
        *control_flow=ControlFlow::Wait;
        match event {
            Event::NewEvents(StartCause::Init)=> println!(""),
            Event::WindowEvent {
                event: WindowEvent::CloseRequested,
                ..
            }=> *control_flow=ControlFlow::Exit,
            _=> (),
        }
    });
}


#[deno_bindgen]
pub fn write_to_clipboard(str: &str) {
    Clipboard::new().write_text(str)
}

#[deno_bindgen]
pub fn read_clipboard()-> String {
    Clipboard::new().read_text().unwrap_or_default()
}

#[deno_bindgen]
pub fn screenshot() {
    todo!()
}


#[deno_bindgen]
pub fn screenshot_of_area() {
    todo!()
}

fn todo()-> String {
    todo!("i didnt check before using that lib as it was so smoll.. that idiot wrote horrible machine dependant code..")
}

#[deno_bindgen]
pub fn calender(_title: &str)-> String {
    todo()
}

#[deno_bindgen]
pub fn error(_error_message: &str)-> String {
    todo()
}

#[deno_bindgen]
pub fn information(_info: &str)-> String {
    todo()
}

#[deno_bindgen]
pub fn progress()-> String {
    todo()
}

#[deno_bindgen]
pub fn question(_question: &str)-> String {
    todo()
}

#[deno_bindgen]
pub fn warning(_message: &str)-> String {
    todo()
}

#[deno_bindgen]
pub fn dialog_box_html(title: &str,html: &str) {
    let event_loop=EventLoop::new();

    let dialog=WindowBuilder::new()
    .with_title(title)
    .build(&event_loop)
    .unwrap();

    let _webview=WebViewBuilder::new(dialog).unwrap()
    .with_html(html)
    .unwrap();

    event_loop.run(move |event, _, control_flow| {
        *control_flow=ControlFlow::Wait;
        match event {
            Event::NewEvents(StartCause::Init)=> println!(""),
            Event::WindowEvent {
                event: WindowEvent::CloseRequested,
                ..
            }=> *control_flow=ControlFlow::Exit,
            _=> (),
        }
    });
}

