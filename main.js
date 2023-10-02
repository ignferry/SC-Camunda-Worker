"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const zeebe_node_1 = require("zeebe-node");
const dotenv_1 = require("dotenv");
const axios_1 = __importDefault(require("axios"));
(0, dotenv_1.config)();
const zbc = new zeebe_node_1.ZBClient();
const restApiBaseUrl = "http://localhost:3000";
// Check class availabilty
zbc.createWorker({
    taskType: "check-class-availability",
    taskHandler: (job) => __awaiter(void 0, void 0, void 0, function* () {
        let classId = job.variables.classId;
        let res = yield axios_1.default.get(restApiBaseUrl + `/class/${classId}`);
        let className = res.data.class_name;
        let totalStudents = res.data.total_students;
        let maxStudents = res.data.max_students;
        return job.complete({
            className: className,
            totalStudents: totalStudents,
            maxStudents: maxStudents
        });
    })
});
// Register student to class
zbc.createWorker({
    taskType: "register-student-to-class",
    taskHandler: (job) => __awaiter(void 0, void 0, void 0, function* () {
        let nim = job.variables.nim;
        let classId = job.variables.classId;
        let className = job.variables.className;
        let res = yield axios_1.default.post(restApiBaseUrl + "/class/register", {
            nim: nim,
            class_id: classId,
            class_name: className
        });
        let outputMessage = res.data.output_message;
        return job.complete({
            outputMessage: outputMessage
        });
    })
});
// Set class full message
zbc.createWorker({
    taskType: "set-class-full-message",
    taskHandler: (job) => __awaiter(void 0, void 0, void 0, function* () {
        let classId = job.variables.classId;
        let className = job.variables.className;
        let res = yield axios_1.default.get(restApiBaseUrl + "/message/class/full", {
            params: {
                class_id: classId,
                class_name: className
            }
        });
        let outputMessage = res.data.output_message;
        return job.complete({
            outputMessage: outputMessage
        });
    })
});
// Set timeout message
zbc.createWorker({
    taskType: "set-timeout-message",
    taskHandler: (job) => __awaiter(void 0, void 0, void 0, function* () {
        let res = yield axios_1.default.get(restApiBaseUrl + "/message/class/timeout");
        let outputMessage = res.data.output_message;
        return job.complete({
            outputMessage: outputMessage
        });
    })
});
