import detectTSNode from "detect-ts-node";

export default detectTSNode || process.env.NODE_ENV === "test";
