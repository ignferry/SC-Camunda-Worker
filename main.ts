import { ZBClient } from "zeebe-node";
import { config } from "dotenv";
import axios from "axios";

config();
const zbc = new ZBClient();
const restApiBaseUrl = "http://localhost:3000"; 

interface FrsPayload {
    nim: string;
    classId: string;
    className: string;
    outputMessage: string;
    totalStudents: number;
    maxStudents: number;
}

// Check class availabilty
zbc.createWorker<FrsPayload, {}, Partial<FrsPayload>>(
    {
        taskType: "check-class-availability",
        taskHandler: async job => {
            let classId = job.variables.classId;

            let res = await axios.get(restApiBaseUrl + `/class/${classId}`);
            
            let className = res.data.class_name;
            let totalStudents = res.data.total_students;
            let maxStudents = res.data.max_students;
            
            return job.complete({
                className: className,
                totalStudents: totalStudents,
                maxStudents: maxStudents
            });
        }
    }
);

// Register student to class
zbc.createWorker<FrsPayload, {}, Partial<FrsPayload>>(
    {
        taskType: "register-student-to-class",
        taskHandler: async job => {
            let nim = job.variables.nim;
            let classId = job.variables.classId;
            let className = job.variables.className;

            let res = await axios.post(
                restApiBaseUrl + "/class/register",
                {
                    nim: nim,
                    class_id: classId,
                    class_name: className
                }
            );

            let outputMessage = res.data.output_message;
            
            return job.complete({
                outputMessage: outputMessage
            });
        }
    }
);

// Set class full message
zbc.createWorker<FrsPayload, {}, Partial<FrsPayload>>(
    {
        taskType: "set-class-full-message",
        taskHandler: async job => {
            let classId = job.variables.classId;
            let className = job.variables.className;

            let res = await axios.get(
                restApiBaseUrl + "/message/class/full",
                {
                    params: {
                        class_id: classId,
                        class_name: className
                    }
                }
            );

            let outputMessage = res.data.output_message;

            return job.complete({
                outputMessage: outputMessage
            });
        }
    }
);

// Set timeout message
zbc.createWorker<FrsPayload, {}, Partial<FrsPayload>>(
    {
        taskType: "set-timeout-message",
        taskHandler: async job => {
            let res = await axios.get(
                restApiBaseUrl + "/message/class/timeout"
            );

            let outputMessage = res.data.output_message;
            
            return job.complete({
                outputMessage:outputMessage
            });
        }
    }
);