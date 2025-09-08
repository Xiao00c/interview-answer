import { Button, Col, Progress, Row, Tag, Typography } from "antd";
import { useEffect, useState, type FC } from "react";

const ONE_SECOND = 1000 * 1;
const IS_DEBUG = false;

const TaskProcessor: FC = () => {
  const [tagColor, setTagColor] = useState<string>("default");
  const [fileCount, setFileCount] = useState<number>(0);
  const [completeCount, setCompleteCount] = useState<number>(0);
  const [failCount, setFailCount] = useState<number>(0);
  const [progressStatus, setProgressStatus] = useState<"active" | undefined>();
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    if (fileCount > 0) {
      if (failCount + completeCount === fileCount) {
        setTagColor("success");
      }
    }
  }, [fileCount, failCount, completeCount]);

  async function onStartBtnClick() {
    // clean previous states;
    setFailCount(0);
    setCompleteCount(0);
    setFileCount(0);
    setLogs([]);

    // load config
    const files = await loadConfig();
    setFileCount(files.length);

    // workout processes
    setTagColor("processing");
    setProgressStatus("active");

    // load files

    // 创建完成promise
    let allResolve: Function | undefined;
    const completionPromise = new Promise((resolve) => {
      allResolve = resolve;
    });

    let idx = 0;
    let completed = 0;

    async function sendRequest() {
      const fileName = files[idx];
      idx++;

      const loadFilePromise = () => loadFile(fileName);
      const retryPromise = retryWithTimeout(fileName, loadFilePromise, 3, 2500)
        .then(() => {
          setCompleteCount((num) => num + 1);
          completed++;
          printlnText(`File: ${fileName} loaded successfully`);
        })
        .catch((err) => {
          setFailCount((num) => num + 1);
          completed++;
          printlnText(err.toString());
        })
        .finally(() => {
          // 所有文件处理完成
          if (completed === fileCount) {
            if (allResolve !== undefined) {
              allResolve();
            }
          }

          if (idx < files.length) {
            sendRequest();
          }
        });

      try {
        await retryPromise;
      } catch (e) {
        console.log(e);
      }
    }

    for (let i = 0; i < 3; i++) {
      if (idx >= files.length) break;

      sendRequest();
    }

    // await finished
    await completionPromise;

    debugger;

    // init system
    await initSystem();
  }

  /**
   * 加载配置⽂件
   * @returns {Promise<string[]>} ⽂件列表
   */
  async function loadConfig() {
    // Simulates an asynchronous file retrieval operation using setTimeout
    //
    // This function mocks a network or file system request by returning a Promise
    // that resolves after a specified delay. The Promise resolves with an array
    // containing 100 file objects, each with unique properties.
    // The implementation includes comprehensive logging for both successful operations
    // and error scenarios, providing visibility into the execution flow.

    // mock file names;
    const lorem: string[] =
      "Lorem ipsum dolor sit amet consectetur adipiscing elit quisque faucibus ex sapien vitae pellentesque sem placerat in id cursus mi pretium tellus duis convallis tempus leo eu aenean sed diam urna tempor pulvinar vivamus fringilla lacus nec metus bibendum egestas iaculis massa nisl malesuada lacinia integer nunc posuere ut hendrerit semper vel class aptent taciti sociosqu ad litora torquent per conubia nostra inceptos himenaeos orci varius natoque penatibus et magnis dis parturient montes nascetur ridiculus mus donec rhoncus eros lobortis nulla molestie mattis scelerisque maximus eget fermentum odio phasellus non purus est efficitur laoreet mauris pharetra vestibulum fusce dictum risus".split(
        " "
      );

    // generate file string as result;
    const files: string[] = [];

    for (let i = 0; i < lorem.length; i++) {
      files.push(`${lorem[i]}(${i + 1})`);
    }

    // random delay in ms
    const delay = Math.floor(Math.random() * 0.3 * ONE_SECOND);

    printlnText(`Loading Config...`);

    return new Promise<string[]>((res, _) => {
      setTimeout(() => {
        printlnText(`Loading Config successfully`);
        res(files);
      }, delay);
    });
  }

  /**
   * 加载⽂件
   * @param {string} file ⽂件名
   * @returns {Promise<void>}
   */
  async function loadFile(file: string) {
    // Asynchronously loads a specified file with simulated network delay (Mock using setTimeout)
    //
    // This method simulates the loading of a file by creating a Promise that resolves
    // or rejects after a random timeout between 1-3 seconds. It has a 90% success rate
    // and 10% failure rate to mimic real-world network conditions.
    //
    // The method logs the entire lifecycle of the file loading process including:
    // - When loading begins
    // - When loading completes successfully
    // - When loading fails
    //
    // On success, it increments the internal counter of loaded files and updates
    // the progress indicator.

    const start = performance.now();

    let delay = Math.random() * 2 * ONE_SECOND + 1 * ONE_SECOND;
    let isSuccess = Math.random() < 0.9;

    IS_DEBUG && printlnText(`RANDOM: ${file} ${delay.toFixed(2)}`);

    return new Promise<void>((res, rej) => {
      setTimeout(() => {
        if (isSuccess) {
          IS_DEBUG &&
            printlnText(
              `SUCCESS: ${file} load in ${(performance.now() - start) / 1000}s`
            );
          res();
        } else {
          IS_DEBUG &&
            printlnText(
              `FAILED: ${file} load in ${(performance.now() - start) / 1000}s`
            );
          rej(new Error(`File loaded fail: ${file}`));
        }
      }, delay);
    });
  }

  /**
   * 初始化系统
   * @returns {Promise<void>}
   * */
  async function initSystem() {
    // Initializes the system with required configurations and resources (Mock using setTimeout)
    //
    // This method performs the necessary setup procedures for the system to function
    // properly. It returns a Promise that resolves after a simulated initialization
    // process that takes 1 second to complete.
    //
    // The initialization process is always successful in this implementation and
    // logs both the start and successful completion of the initialization process.
    // This provides visibility into the system's startup sequence.

    console.log("called");

    printlnText("System initializing, please stand by...");

    return new Promise<void>((res, _) => {
      setTimeout(() => {
        res();
      }, ONE_SECOND);
    }).then(() => {
      printlnText("Initialization completed");
    });
  }

  /**
   * add retry for promise
   * @param file file name
   * @param func execute promise
   * @param maxRetryTimes retry max times
   * @param timeout ms to timeout
   * @returns
   */
  async function retryWithTimeout<T>(
    file: string,
    func: () => Promise<T>,
    maxRetryTimes: number,
    timeout: number
  ) {
    let attemptTimes = 0;

    while (attemptTimes < maxRetryTimes) {
      try {
        return await Promise.race([
          new Promise((_, rej) => {
            setTimeout(() => {
              rej(new Error(`File loaded timeout: ${file}`));
            }, timeout);
          }),
          func(),
        ]);
      } catch (e) {
        attemptTimes++;

        if (attemptTimes == maxRetryTimes) {
          throw new Error(`Retry error: ${file} load reached retry limit`);
        }

        printlnText(`${e}, retry attempt times: ${attemptTimes}`);

        // backoff retry
        await new Promise((res) =>
          setTimeout(res, Math.pow(2, attemptTimes) * 0.1 * ONE_SECOND)
        );
      }
    }
  }

  function printlnText(text: string) {
    setLogs((arr: string[]) => [...arr, text]);
  }

  return (
    <div
      style={{
        height: "calc(100vh - 72px)",
        width: "100vw",

        paddingTop: 72,
      }}
    >
      <Row align="middle" justify="start">
        <Col span={2} />
        <Col span={4}>
          <Button onClick={onStartBtnClick}>开始处理</Button>
        </Col>
        <Col span={4}>
          <Typography.Text>状态:</Typography.Text>

          <Tag
            color={tagColor}
            style={{
              fontSize: 14,
              marginLeft: 4,
            }}
          >
            {tagColor === "processing" ? "执行中" : "空闲"}
          </Tag>
        </Col>
        <Col span={2}>fileCount:{fileCount} </Col>
        <Col span={2}>completeCount:{completeCount} </Col>
        <Col span={2}>failCount:{failCount} </Col>
      </Row>

      <Row style={{ marginTop: 24 }}>
        <Col offset={2} span={20}>
          <Progress
            percent={completeCount + failCount}
            status={progressStatus}
          />
        </Col>
      </Row>

      <Row>
        <Col offset={2} span={20}>
          <div style={{ width: "100%", height: 680, overflowY: "scroll" }}>
            {logs.map((str) => (
              <div>{str}</div>
            ))}
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default TaskProcessor;
