// deno-lint-ignore-file no-explicit-any
// Copyright 2020-2021 the Deno authors. All rights reserved. MIT license.

import { ensureDirSync } from "https://deno.land/std@0.132.0/fs/ensure_dir.ts";
import { createFromBuffer,GlobalConfiguration } from "https://deno.land/x/dprint@0.2.0/mod.ts";
import * as Cache from "https://deno.land/x/cache@0.2.13/mod.ts";


Cache.configure({ directory: Cache.options.directory });
const cache=Cache.namespace("deno_bindgen_cli");

const globalConfig: GlobalConfiguration={
  indentWidth: 2,
  lineWidth: 80,
};

const file=await cache.cache(
  "https://plugins.dprint.dev/typescript-0.57.0.wasm",
);

const tsFormatter=createFromBuffer(Deno.readFileSync(file.path));

tsFormatter.setConfig(globalConfig, {
  semiColons: true,
});


const Type: Record<string, string>={
  void: "null",
  i8: "number",
  u8: "number",
  i16: "number",
  u16: "number",
  i32: "number",
  u32: "number",
  i64: "bigint",
  u64: "bigint",
  usize: "bigint",
  isize: "bigint",
  f32: "number",
  f64: "number",
};

const BufferTypes: Record<string, string>={
  str: "string",
  buffer: "Uint8Array",
  buffermut: "Uint8Array",
  ptr: "Uint8Array",
};

enum Encoder {
  JsonStringify="JSON.stringify",
  None="",
}

const BufferTypeEncoders: Record<keyof typeof BufferTypes, Encoder>={
  str: Encoder.None,
  buffer: Encoder.None,
  buffermut: Encoder.None,
  ptr: Encoder.None,
};

type TypeDef=Record<string, Record<string, string>>;

function resolveType(typeDefs: TypeDef, type: any): string {
  const t=typeof type==="string"?type:type.structenum.ident;
  if (Type[t]!==undefined) return Type[t];
  if (BufferTypes[t]!==undefined) return BufferTypes[t];
  if (Object.keys(typeDefs).find(f=> f===t)!==undefined) {
    return t;
  }
  return "any";
}

function resolveDlopenParameter(typeDefs: TypeDef, type: any): string {
  const t=typeof type==="string"?type:type.structenum.ident;
  if (Type[t]!==undefined) return t;
  if (BufferTypes[t]!==undefined) {
    return "buffer";
  }
  if (
    Object.keys(typeDefs).find(f=> f===t)!==undefined
  ) {
    return "buffer";
  } else {
    return "pointer";
  }
  // deno-lint-ignore no-unreachable
  throw new TypeError(`Type not supported: ${t}`);
}

type Sig=Record<
  string,
  {
    parameters: any[];
    result: string;
    nonBlocking?: boolean;
  }
>;

type Options={
  le?: boolean;
  release?: boolean;
  releaseURL: string | undefined;
};

function isTypeDef(p: any) {
  return typeof p!=="string";
}

function isBufferType(p: any) {
  return isTypeDef(p) || BufferTypes[p]!==undefined;
}

// deno-lint-ignore no-unused-vars
function needsPointer(p: any) {
  return isBufferType(p) && p!=="buffer" && p!=="buffermut";
}

function getExt() {
  switch(Deno.build.os) {
    case "windows":
      return "dll";
    case "darwin":
      return "dylib";
    default:
      return "so";
  }
}


function getName(name: string) {
  switch(Deno.build.os) {
    case "windows":
      return `${name}.dll`;
    case "darwin":
      return `lib${name}.dylib`;
    default:
      return `lib${name}.so`;
  }
}

// TODO(@littledivy): factor out options in an interface
export function codegen(
  fetchPrefix: string,
  name: string,
  decl: TypeDef,
  typescript: Record<string, string>,
  signature: Sig,
  options?: Options
) {
  const bin=`bindings/bin/${Deno.build.target}.${getExt()}`;
  
  
  ensureDirSync("bindings/bin");
  Deno.copyFileSync(`${fetchPrefix}/${getName(name)}`,bin);
  
  
  if(Deno.args.includes("--no-bindings")) Deno.exit(0);

  signature=Object.keys(signature)
    .sort()
    .reduce(
      (acc, key)=> ({
        ...acc,
        [key]: signature[key],
      }),
      {},
    );
  const prototype=Deno.readTextFileSync("./bindings/bindings.prototype.json").trim();

  return `
const encoder=new TextEncoder;
const decoder=new TextDecoder();

function decode(buffer: Uint8Array): string {
  return decoder.decode(buffer);
}

function encode(v: string|Uint8Array): Uint8Array {
  return typeof v !== "string" ? v : encoder.encode(v);
}

${getExt.toString()}

// deno-lint-ignore no-explicit-any
function readPointer(v: any): Uint8Array {
  const ptr=new Deno.UnsafePointerView(v);
  const lengthBe=new Uint8Array(4);
  const view=new DataView(lengthBe.buffer);
  ptr.copyInto(lengthBe, 0);
  const buf=new Uint8Array(view.getUint32(0));
  ptr.copyInto(buf, 4);
  return buf;
}

const bindingsUrl=new URL(\`./bin/\${Deno.build.target\}.\${getExt()}\`, import.meta.url);
${
      typeof options?.releaseURL==="string"
       ?`
import { dlopen, FetchOptions } from "https://deno.land/x/plug@1.0.1/mod.ts";
let bindingsUri=bindingsUrl.toString();
if (!bindingsUri.endsWith("/"))bindingsUri+="/";

let darwin: string|{ aarch64: string; x86_64: string }=bindingsUri;

const opts: FetchOptions={
  name: "${name}",
  url: {
    darwin,
    windows: bindingsUri,
    linux: bindingsUri,
  },
  suffixes: {
    darwin: {
      aarch64: "_arm64",
    },
  },
  cache: ${options?.release?'"use"':'"reloadAll"'},
};
export const { symbols,close }=await dlopen(opts, {
  `
       :`
let bindingsUri=bindingsUrl.pathname;

// https://docs.microsoft.com/en-us/windows/win32/api/libloaderapi/nf-libloaderapi-loadlibrarya#parameters
if (Deno.build.os==="windows") {
  bindingsUri=bindingsUri.replace(/\\//g, "\\\\");
  // Remove leading slash
  if (bindingsUri.startsWith("\\\\")) {
    bindingsUri=bindingsUri.slice(1);
  }
}

export const lib=Deno.dlopen(bindingsUri, {`
    }
  ${
      Object.keys(signature)
        .map(
          (sig) =>
            `${sig}: { parameters: [ ${
              signature[sig].parameters
                .map((p)=> {
                  const ffiParam=resolveDlopenParameter(decl, p);
                  // FIXME: Dupe logic here.
                  return `"${ffiParam}"${isBufferType(p)?`, "usize"`:""}`;
                })
                .join(", ")
            } ], result: "${
              resolveDlopenParameter(
                decl,
                signature[sig].result,
              )
            }", nonblocking: ${String(!!signature[sig].nonBlocking)} }`,
        )
        .join(", ")
    },${prototype.substring(1,prototype.length-1)}});
    
export const { symbols }=xd(lib.symbols);
function xd<T>(symbols: T) {
  return {
    [Symbol.dispose]: ()=> lib.close(),
    symbols
  };
}
const fn=Deno.UnsafeCallback.threadSafe({
  parameters: ["buffer","usize"],
  result: "void"
},(buff: Deno.PointerValue<unknown>,len: number|bigint)=> {
  throw buff?decoder.decode(new Uint8Array(Deno.UnsafePointerView.getArrayBuffer(buff,len as number))):"";
});
fn.unref();
symbols.set_throw(fn.pointer);
    
${
  Object.keys(decl)
  .sort()
  .map((def)=> typescript[def])
  .join("\n")
}
${
  Object.keys(signature)
  .map((sig)=> {
    const { parameters, result, nonBlocking }=signature[sig];

    return `export function ${sig}(${
      parameters
        .map((p, i)=> `a${i}: ${resolveType(decl, p)}`)
        .join(",")
    }) {
  ${
    parameters
      .map((p, i) =>
        isBufferType(p)
         ?`const a${i}_buf=encode(${
            BufferTypeEncoders[p] ?? Encoder.JsonStringify
          }(a${i}));`
         :null
      )
      .filter((c)=> c!==null)
      .join("\n")
    }

  const rawResult=symbols.${sig}(${
            parameters
              .map((p, i)=> (isBufferType(p)
               ?`a${i}_buf, a${i}_buf.byteLength`
               :`a${i}`)
              )
              .join(", ")
          });
  ${
            isBufferType(result)
             ?nonBlocking
               ?`const result=rawResult.then(readPointer);`
               :`const result=readPointer(rawResult);`
             :"const result=rawResult;"
          };
  ${
            isTypeDef(result)
             ?nonBlocking
               ?`return result.then(r=> JSON.parse(decode(r))) as Promise<${
                  resolveType(
                    decl,
                    result,
                  )
                }>;`
               :`return JSON.parse(decode(result)) as ${
                  resolveType(decl, result)
                };`
             :result==="str"
             ?nonBlocking
               ?"return result.then(decode);"
               :"return decode(result);"
             :"return result;"
          };
}`;
      })
      .join("\n")
    }
 `;
}
