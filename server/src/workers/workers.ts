import workerpool from "workerpool";
import workerFunctions from "./workerFunctions";

workerpool.worker(workerFunctions);
