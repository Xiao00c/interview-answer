import { Button, Col, InputNumber, Row, Space } from "antd";
import { useEffect, useState, type FC } from "react";
import { LAND_TYPE, LAND_TYPE_THRESHOLD } from "../constant";
import type { LandType } from "./type";
import { getBackgroundColorByType } from "./utils/renderHelper";

type MapUnit = {
  r: number;
  c: number;
  type: LandType | undefined;
};

const MapGenerator: FC = () => {
  const [matrix, setMatrix] = useState<MapUnit[][]>([]);

  const [moistureSpread, setMoistureSpread] = useState<number>(15);
  const [temperatureSpread, setTemperatureSpread] = useState<number>(15);
  const [climateStability, setClimateStability] = useState<number>(20);

  const [cellHeight, setCellHeight] = useState<number>(40);

  /**
   * 1.init matrix when loaded
   * 2.resize cell height once loaded
   */
  useEffect(() => {
    initMatrix();

    const browserHeight = window.innerHeight;
    const idealHeight = (browserHeight - 48 - 48) / 10;
    const minHeight = 40;

    setCellHeight(Math.max(idealHeight, minHeight));
  }, []);

  function initMatrix() {
    const tempMatrix: MapUnit[][] = [];

    for (let r = 0; r < 10; r++) {
      const row: MapUnit[] = [];

      for (let c = 0; c < 10; c++) {
        row.push({
          r,
          c,
          type: undefined,
        });
      }

      tempMatrix.push(row);
    }

    setMatrix(tempMatrix);
  }

  function generateNewWorld() {
    const tempMatrix: MapUnit[][] = [];
    for (let r = 0; r < 10; r++) {
      const row: MapUnit[] = [];

      for (let c = 0; c < 10; c++) {
        row.push({
          r,
          c,
          type: undefined,
        });
      }

      tempMatrix.push(row);
    }

    for (let r = 0; r < 10; r++) {
      for (let c = 0; c < 10; c++) {
        tempMatrix[r][c].type = generateTypeByPair(
          r,
          c,
          tempMatrix
        ) as LandType;
      }
    }

    setMatrix(tempMatrix);
  }

  function generateTypeByPair(r: number, c: number, tempMatrix: MapUnit[][]) {
    const threshold = {
      ...LAND_TYPE_THRESHOLD,
    };

    let rng = Math.random() * 100;

    // (0,0)
    if (r === 0 && c === 0) {
      // use original
    }
    // (0,0-9)
    else if (r === 0) {
      const leftType = tempMatrix[r][c - 1].type!;
      if (rng <= moistureSpread) {
        return leftType;
      } else {
        threshold[leftType] = 0;
      }
    }
    // (0-9,0)
    else if (c === 0) {
      const topType = tempMatrix[r - 1][c].type!;
      if (rng <= temperatureSpread) {
        return topType;
      } else {
        threshold[topType] = 0;
      }
    }
    // (x,y)
    else {
      const topType = tempMatrix[r - 1][c].type!;
      const leftType = tempMatrix[r][c - 1].type!;

      if (topType === leftType) {
        if (rng <= climateStability) {
          return leftType;
        } else {
          threshold[leftType] = 0;
        }
      } else {
        if (rng <= moistureSpread) {
          return leftType;
        } else {
          threshold[leftType] = 0;
        }

        rng = Math.random() * 100;

        if (rng <= temperatureSpread) {
          return topType;
        } else {
          threshold[topType] = 0;
        }
      }
    }

    let total = 0;
    for (const key in threshold) {
      total += threshold[key as LandType];
    }

    rng = Math.random() * total;

    if (rng <= threshold.FOREST) {
      return LAND_TYPE.FOREST;
    }
    rng -= threshold.FOREST;

    if (rng <= threshold.DESERT) {
      return LAND_TYPE.DESERT;
    }
    rng -= threshold.DESERT;

    if (rng <= threshold.OCEAN) {
      return LAND_TYPE.OCEAN;
    }
    rng -= threshold.OCEAN;

    if (rng <= threshold.MOUNTAIN) {
      return LAND_TYPE.MOUNTAIN;
    }

    return LAND_TYPE.PLAINS;
  }

  function resetAll() {
    initMatrix();
    setMoistureSpread(15);
    setTemperatureSpread(15);
    setClimateStability(20);
  }

  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
      }}
    >
      <Row style={{ padding: "8px 0px" }}>
        <Col span={5} />
        <Col span={4}>
          湿度传播:{" "}
          <InputNumber
            max={100}
            min={0}
            onChange={(val) => setMoistureSpread(val ?? 0)}
            value={moistureSpread}
          />
        </Col>
        <Col span={4}>
          温度传播:{" "}
          <InputNumber
            max={100}
            min={0}
            onChange={(val) => setTemperatureSpread(val ?? 0)}
            value={temperatureSpread}
          />
        </Col>
        <Col span={4}>
          气候稳定:{" "}
          <InputNumber
            max={100}
            min={0}
            onChange={(val) => setClimateStability(val ?? 0)}
            value={climateStability}
          />
        </Col>
        <Col span={4}>
          <Space>
            <Button onClick={resetAll}>重置所有</Button>

            <Button onClick={generateNewWorld} type="primary">
              生成新世界
            </Button>
          </Space>
        </Col>
        <Col span={3} />
      </Row>

      <Row>
        <Col span={6} />
        <Col span={12}>
          {matrix.map((row) => (
            <Row>
              {row.map((col) => (
                <Col
                  flex="10%"
                  key={`${col.r},${col.c}`}
                  style={{
                    border: "1px solid lightgray",
                    backgroundColor: getBackgroundColorByType(col.type),
                    minHeight: cellHeight,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      height: "100%",
                    }}
                  >
                    <div style={{ flexGrow: 1 }}>{col.type}</div>
                    <div
                      style={{
                        alignSelf: "end",
                        padding: "0 8px",
                      }}
                    >
                      ({col.r}, {col.c})
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
          ))}
        </Col>
        <Col span={6} />
      </Row>

      {/* <div
        style={{
          width: 1000,
          display: "flex",
          flexDirection: "column",
          margin: "auto",
        }}
      >
        {matrix.map((arr) => (
          <div
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "row",
              flex: "1 1 1",
            }}
          >
            {arr.map((item) => (
              <div
                key={`${item.r},${item.c}`}
                style={{
                  border: "1px solid gray",
                  backgroundColor: getBackgroundColorByType(item.type),
                  height: "100%",
                  width: 100,
                }}
              >
                <div>
                  ({item.r}, {item.c})
                </div>
                <div>type: {item.type}</div>
              </div>
            ))}
          </div>
        ))}
      </div> */}
    </div>
  );
};

export default MapGenerator;
