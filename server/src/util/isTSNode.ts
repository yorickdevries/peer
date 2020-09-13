let isTSNode = false;

if (
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  process[Symbol.for("ts-node.register.instance")] ||
  process.env.NODE_ENV === "test"
) {
  isTSNode = true;
}

export default isTSNode;
