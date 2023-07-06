const express = require('express');
const expressWs = require('express-ws');
const _ = require('lodash');
const cors = require('cors')

const app = express();
expressWs(app);
app.use(cors())

var now = Date.now();

// 路由設定
app.all('/', (req, res) => {
  res.send('Hello, World!');
});

app.all('/search', express.json(), (req, res) => {
  // res.send('Hello, World!');
  setCORSHeaders(res);
  var timeserie = fackDataGen();
  var result = [];
  _.each(timeserie, function (ts) {
    result.push(ts.target);
  });

  res.json(result);
  res.end();
});

// WebSocket 路由設定
app.ws('/ws', (ws, req) => {
  console.log('WebSocket連接建立成功');

  ws.on('message', (msg) => {
    // console.log('接收到訊息：', msg);
    const reqJson = JSON.parse(msg)
    if (reqJson.method === 'getValue') {
      // const dataRes = fakeResponse(reqJson.data.targets)
      // ws.send(JSON.stringify({ method: 'getValue', data: dataRes}));
      ScheduledSending (ws, reqJson.data.targets)
    }
    // 回傳訊息給客戶端
    // ws.send('收到訊息：' + msg);
  });

  ws.on('close', () => {
    console.log('WebSocket連接關閉');
  });
});

// 啟動伺服器
app.listen(1688, () => {
  console.log('伺服器已啟動，監聽在 http://localhost:1688');
});

function setCORSHeaders(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST");
  res.setHeader("Access-Control-Allow-Headers", "accept, content-type");
}


function fackDataGen() {
  var timeserie = []
  var mapData = {
    "target": "map_01",
    "datapoints": [
      ["0,20,13", 1450754160]
    ]
  }
  timeserie.push(mapData)
  for (var i = 0; i < 50; i++) {
    var series = {
      "target": "upper_" + i,
      "datapoints": []
    };
    var decreaser = 0;
    for (var y = 0; y < 50; y++) {
      series.datapoints[y] = [0, 0]
      series.datapoints[y][0] = Math.round(Math.random() * 100)
      series.datapoints[y][1] = Math.round((now - decreaser) / 1000) * 1000
      decreaser += 50000;
    }
    timeserie.push(series)
  }
  return timeserie
}

function fakeResponse(targets) {
  var tsResult = [];
  let fakeData = fackDataGen()
  _.each(targets, function (target) {
    if (target.type === 'table') {
      const table = {
        target: target.target,
        type: 'table',
        columns: [{
          text: 'Time',
          type: 'time'
        }, {
          text: 'Country',
          type: 'string'
        }, {
          text: 'Number',
          type: 'number'
        }],
        rows: [
          [1234567, 'SE', 123],
          [1234567, 'DE', 231],
          [1234567, 'US', 321],
        ]
      }
      tsResult.push(table);
    } else {
      if (target.target === 'map_01') {
        var mapData = {
          target: 'map_01',
          datapoints: []
        }
        var d = new Date();
        var t = d.getTime();
        var sec = d.getSeconds();
        var degree = d.getMinutes() * 6 % 360;
        var seg = 5;
        for (var i = 0; i < seg; i++) {
          var theta = 2 * Math.PI / seg * ((i + sec) % seg);
          mapData.datapoints.push([30 * Math.sin(theta) + "," + 30 * Math.cos(theta) + "," + degree + "," + 30 * Math.random(), Number(t + i * 1000)])
        }
        tsResult.push(mapData)
      } else {
        var k = _.filter(fakeData, function (t) {
          return t.target === target.target;
        });

        _.each(k, function (kk) {
          tsResult.push(kk)
        });
      }
    }
  });
  return tsResult;
}

function ScheduledSending (ws, targets) {
  if (ws && ws.send) {
    const dataRes = fakeResponse(targets)
    ws.send(JSON.stringify({ method: 'getValue', data: dataRes}));
    setTimeout(() => {
      ScheduledSending (ws, targets)
    }, 1000)
  }
}