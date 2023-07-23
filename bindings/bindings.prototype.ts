

export const prototypes: Deno.ForeignLibraryInterface={
  confirm: {
    parameters: ["buffer","buffer","u8"],
    result: "bool",
    nonblocking: true
  },
  confirm_sync: {
    parameters: ["buffer","buffer","u8"],
    result: "bool"
  },
  spawn: {
    parameters: ["function"],
    result: "void"
  }
};


