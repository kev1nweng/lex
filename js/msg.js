export const msg = {
  prefix: "[Myphlex]",
  info(msg) {
    console.log(this.prefix, msg);
  },
  error(msg) {
    console.error(this.prefix, msg);
  },
  warn(msg) {
    console.warn(this.prefix, msg);
  },
};
