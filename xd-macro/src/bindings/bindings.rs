
use std::{
  fs,
  io,
  collections::HashMap,
  path::Path,
};

use quote::ToTokens;
use serde::{
  Serialize,
  Deserialize
};

use syn::{
  Signature,
  Type,
  ReturnType as Res
};

macro_rules! unsupported {
  ()=> {
    panic!("unsupported type")
  }
}

macro_rules! match_fn {
  ($f:expr)=> {
    match &$f.abi {
      None=> unsupported!(),
      _=> Self::Pointer
    }
  }
}


macro_rules! match_path {
  ($path:expr,$def:expr)=> {
    match $path.to_token_stream().to_string().as_str() {
      "u8"=> Self::U8,
      "u16"=> Self::U16,
      "u32"=> Self::U32,
      "u64"=> Self::U64,
      "usize"=> Self::Usize,
      "i8"=> Self::I8,
      "i16"=> Self::I16,
      "i32"=> Self::I32,
      "i64"=> Self::I64,
      "isize"=> Self::Isize,
      "f32"=> Self::F32,
      "f64"=> Self::F64,
      "bool"=> Self::Bool,
      _=> $def
    }
  }
}

macro_rules! match_ptrs {
  ($ptr:expr)=> {
    match $ptr.elem.to_token_stream().to_string().as_str() {
      "u8"=> Self::Buffer,
      _=> Self::Pointer
    }
  };
}




#[derive(Serialize,Deserialize)]
#[serde(rename_all="lowercase")]
pub(crate) enum NativeType {
  U8,
  U16,
  U32,
  U64,
  Usize,
  I8,
  I16,
  I32,
  I64,
  Isize,
  F32,
  F64,
  Bool,
  Function,
  Pointer,
  Buffer
}

impl From<&Type> for NativeType {
  fn from(value: &Type)-> Self {
    match value {
      Type::Ptr(ptr)=> match_ptrs!(ptr),
      Type::Path(path)=> match_path!{path,unsupported!()},
      Type::BareFn(f)=> match_fn!(f),
      _=> unsupported!()
    }
  }
}


#[derive(Serialize,Deserialize,Default)]
#[serde(rename_all="lowercase")]
pub(crate) enum ReturnType {
  U8,
  U16,
  U32,
  U64,
  Usize,
  I8,
  I16,
  I32,
  I64,
  Isize,
  F32,
  F64,
  Bool,
  Function,
  Pointer,
  Buffer,
  #[default]
  Void
}

impl From<&Res> for ReturnType {
  fn from(value: &Res)-> Self {
    let ty=if let Res::Type(_,ty)=value { ty } else {
      return Default::default();
    };

    match ty.as_ref() {
      Type::Ptr(ptr)=> match_ptrs!(ptr),
      Type::Path(path)=> match_path!(path,Self::Void),
      Type::BareFn(f)=> match_fn!(f),
      _=> unsupported!()
    }
  }
}

macro_rules! io_res {
  ($res:expr)=> {
    $res.map_err(|err| io::Error::new(
      err.io_error_kind().unwrap_or(io::ErrorKind::InvalidInput),
      err
    ))
  };
}

pub(crate) struct Bindings {
  path: Box<Path>,
  bindings: HashMap<Box<str>,FnSig>
}

impl Bindings {
  pub(crate) fn open<P: AsRef<Path>>(path: P)-> io::Result<Self> {
    let bindings=serde_json::from_slice(&fs::read(&path).unwrap_or_default()).unwrap_or_default();

    Ok(Self {
      path: path.as_ref().into(),
      bindings
    })
  }

  pub(crate) fn save(self)-> io::Result<()> {
    fs::write(self.path,io_res!(serde_json::to_vec_pretty(&self.bindings))?)
  }

  pub(crate) fn append<P: AsRef<Path>,S: Into<Box<str>>>(path: P,name: S,sig: FnSig)-> io::Result<()> {
    let mut this=Self::open(path)?;
    this.bindings.insert(name.into(),sig);
    this.save()
  }
}


#[derive(Serialize,Deserialize,Default)]
#[serde(rename_all="camelCase")]
pub(crate) struct FnSig {
  parameters: Box<[NativeType]>,
  result: ReturnType,
  non_blocking: Option<bool>
}


impl From<&Signature> for FnSig {
  fn from(sig: &Signature) -> Self {
    let mut parameters=Vec::<NativeType>::with_capacity(sig.inputs.len());

    for arg in sig.inputs.iter() {
      match arg {
        syn::FnArg::Receiver(_)=> unreachable!(),
        syn::FnArg::Typed(pat_type)=> parameters.push(pat_type.ty.as_ref().into()),
      }
    }
    
    FnSig {
      parameters: parameters.into_boxed_slice(),
      result: From::from(&sig.output),
      non_blocking: sig.asyncness.map(|_| true)
    }
  }
}

