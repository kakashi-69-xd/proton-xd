// deno-lint-ignore-file no-explicit-any
import { Option,None,Some } from '../option/option.ts';
import { Exception } from '../exception.ts';
import { $panic } from "../../mod.ts";

export type Ok<T>=T;
export type Err<E extends Error=Error>=E;
export type Res<T,E>={ ok: T }|{ err: E };


export class Result<T,E> extends Exception<T,E> {
  protected isException: boolean;

  constructor(private _result: Res<T,E>) {
    super();
    this.isException=Object.hasOwn(_result,"err");
  }

  protected match<T1,E1>(t: (t: T)=> T1,e: (e: E)=> E1): T1|E1 {
    const res=this._result as any;
    return Object.hasOwn(this._result,"ok")?t(res.ok):e(res.err);
  }

  protected res(): any {
    const res=this._result as any;
    return res[Object.hasOwn(res,"ok")?"ok":"err"];
  }

  public get result(): T|E {
    return this.res();
  }

  /**
   * * Returns `Err` if the value is `Err`,otherwise returns optb.
   * * Arguments passed to and are eagerly evaluated; if you are passing the result of a function call, it is recommended to use andThen.
   * 
   * # Example
   * ```ts
   * const x=Ok(0);
   * const y=Ok(69)
   * $assertEq(x.and(y),Ok(69));
   * ```
   */
  public override and(res: Result<T,E>): Result<T,E> {
    return this.isException?this.clone():res;
  }

  /**
   * * Returns `Err` if the option is `Err`, otherwise calls f with the wrapped value and returns the result.
   * * some languages call this operation flatmap.
   * 
   * # Example
   * ```ts
   * const xd=Ok("xd");
   * $assertEq(xd.andThen(x=> Ok("69")),Ok("69"));
   * ```
   */
  public override andThen(f: (xd: T)=> Result<T,E>) {
    return this.match(f,_=> this.clone());
  }

  /**
   * * Returns the `Result` if it contains a value,otherwise returns optb.
   * 
   * # Example
   * ```ts
   * const xd=Err("im an Err");
   * $assertEq(xd.or(Ok(69)),Ok(69));
   * ```
   */
  public override or(optb: this): this {
    return this.isException?optb:this.res();
  }

  /**
   * * Returns the `Result` if it contains a value, otherwise calls `f` and returns the result.
   * 
   * # Example
   * ```ts
   * const xd=Err("im an Err..xd");
   * $assertEq(xd.orElse(()=> Ok(69)),Ok(69));
   * ```
   */
  public override orElse(op: (err: E)=> this) {
    return this.match(_=> this.clone(),op);
  }

  public err(): Option<E> {
    return this.match(_=> None(null),err=> Some(err));
  }

  public ok(): Option<T> {
    return this.match(ok=> Some(ok),_=> None(null));
  }

  /**
   * * Returns the contained `Ok` value.
   * 
   * # Panics
   * * Panics if the value is a `Err` with a custom panic message provided by msg.
   * 
   * # Example
   * ```ts
   * const xd=Ok(69);
   * console.log(xd.expect("xd is an Err"));
   * ```
   */
  public override expect(msg: string): T {
    return this.match(t=> t,()=> $panic(msg));
  }

  /**
   * * Returns the contained `Err` value.
   * 
   * # Panics
   * * Panics if the value is a `Ok` with a custom callback.
   * 
   * # Example
   * ```ts
   * const xd=Ok(69);
   * xd.expectNone(()=> $panic("xd is Ok"));
   * ```
   */
  public expectErr(callback: (s: T)=> never): E {
    return this.match(callback,e=> e);
  }

  /**
   * Returns whether the object contains a `Ok` value.
   */
  public override contains(): boolean {
    return !this.isException;
  }

  /**
   * Returns whether the object contains a `Err` value.
   */
  public containsErr() {
    return this.isException;
  }

  /**
   * * Inserts the given `Ok` value in the current `Result`
   * # Example
   * ```ts
   * const xd=Err("Err");
   * $assertEq(xd.insert(69),Ok(69));
   * ```
   */
  public insert(ok: T) {
    this._result={ok};
    this.isException=false;
  }

  /**
   * * Returns the contained `Ok` value or Inserts the given `Ok` value in the current `Result` and returns it
   * # Example
   * ```ts
   * const xd=Err("Err");
   * $assertEq(xd.getOrInsert(69),Ok(69));
   * ```
   */
  public getOrInsert(ok: T): T {
    if(this.isException) this._result={ ok };
    return (this._result as any).ok;
  }

  /**
   * * Returns the contained `Ok` value.
   * * Because this function may panic, its use is generally discouraged. Instead, prefer to use pattern matching and handle the None case explicitly, or call `unwrapOr`, `unwrapOrElse`.
   * # Panics
   * Panics if the self value equals `Err`.
   * # Example
   * ```ts
   * const xd=Ok(69);
   * $assertEq(xd.unwrap(),69);
   * ```
   */
  public override unwrap(): T {
    return this.match(t=> t,e=> $panic(e as any));
  }

  /**
   * * Returns the contained `Ok` value or a provided default.
   * * Arguments passed to unwrapOr are eagerly evaluated; if you are passing the result of a function call, it is recommended to use `unwrapOrElse`.
   * 
   * # Example
   * ```ts
   * const xd=Err("Err");
   * $assertEq(xd.unwrapOr(69),Ok(69));
   * ```
   */
  public override unwrapOr(op: T): T {
    return this.match(t=> t,_=> op);
  }

  /**
   * Returns the contained `Ok` value or if the value is `Err` calls `f` and returns the result.
   * # Example
   * ```ts
   * const xd=Err("Err");
   * $assertEq(xd.unwrapOrElse(()=> Ok(69)),Ok(69));
   * ```
   */
  public override unwrapOrElse(f: (err: E) => T): T {
    return this.match(t=> t,f);
  }

  public override unwrapUnchecked(): T|E {
    return this.res();
  }


  public static Ok<T>(ok: T) {
    return new Result<T,any>({ ok });
  }

  public static Err<E>(err: E) {
    return new Result<any,E>({ err });
  }
}


export function Err<T,E>(err: E) {
  return new Result<T,E>({ err });
}
export function Ok<T,E>(ok: T) {
  return new Result<T,E>({ ok });
}
