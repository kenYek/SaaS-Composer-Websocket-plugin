(function (global) {
  if (global.scPlugin &&
    global.scPlugin.datasource &&
    global.scPlugin.datasource["websocket-simple-json-datasource"]) {
    return;
  }
  commonUtil.createObjFromString(global, 'scPlugin.datasource.websocket-simple-json-datasource', {});

  var simpleJsonSource = {};

  simpleJsonSource.dataBindingUI = function (sourceFormPane, targets) {
    var S = hteditor.getString;
    if (targets && targets[0] && targets[0]['sourceType']) {
      dataBindingUI.addSrouceTypeRow(sourceFormPane, targets[0]['sourceType']);
    } else {
      dataBindingUI.addSrouceTypeRow(sourceFormPane);
    }
    if (targets && targets[0] && targets[0]['formatType']) {
      dataBindingUI.addFormatTypeRow(sourceFormPane, targets[0]['formatType']);
    } else {
      dataBindingUI.addFormatTypeRow(sourceFormPane);
    }
    if (targets && targets[0] && targets[0]['scDataType']) {
      dataBindingUI.addDataTypeRow(sourceFormPane, targets[0]['scDataType']);
    } else {
      dataBindingUI.addDataTypeRow(sourceFormPane);
    }
    if (targets && targets[0] && targets[0]['sourceType']) {
      var targetListComboBox = new ht.widget.ComboBox();

      // scadaNodeComboBox.setValue(source);
      targetListComboBox.setWidth(90);
      targetListComboBox.setDropDownWidth(140);
      targetListComboBox.setEditable(true);
      targetListComboBox.onValueChanged = function () {};
      sourceFormPane.addRow([S('target'), {
        id: 'target',
        label: 'String',
        element: targetListComboBox,
        unfocusable: true
      }], [55, 0.1]);

      dataSourceUtil.sendHttpReqBySourceType(targets[0]['sourceType'], '/search', [], function (response) {
        if (Array.isArray(response) && response.length > 0) {
          var values, labels;
          if (typeof (response[0]) === "string") {
            values = response,
              labels = response;
          } else {
            values = [], labels = [];
            for (var i = 0; i < response.length; i++) {
              values.push(response[i]['text']);
              labels.push(response[i]['text']);
            }
          }
          targetListComboBox.setValues(values);
          targetListComboBox.setLabels(response);
          if (typeof (targets[0]['target']) != "undefined") {
            targetListComboBox.setValue(targets[0]['target']);
          } else {
            targetListComboBox.setValue(values[0]);
          }
        }

        return true;
      });
    }
  }

  simpleJsonSource.applyDataBindingUI = function (sourceFormPane) {
    var targets = [];
    var paneRows = sourceFormPane.getRows();
    var target = {};
    for (var i = 0; i < paneRows.length; i++) {
      if (paneRows[i]['items']) {
        target[paneRows[i]['items'][1]['id']] = sourceFormPane.v(paneRows[i]['items'][1]['id']);
      }
    }
    targets.push(target);
    return targets;
  };

  simpleJsonSource.mapToValue = function (aniPropName, formatType, dataResult) {
    //special property list
    //table
    if (['table.columns', 'table.dataSource'].indexOf(aniPropName) > -1) {
      return dataResult;
    }

    if (formatType == 'timeseries') {
      return dataRefreshUtil.refreshTimeSeriesData(dataResult);
    } else if (formatType == 'table') {
      return dataRefreshUtil.refreshTableData(dataResult);
    } else {
      return dataResult
    }
    return dataResult;
  };

  simpleJsonSource.wsConnect = function (sourceName, reqTargets, callback, option) {
    var queryType = '/ws';
    // var proxyqueryType = '/ws';
    var sourceList = dataSourceUtil.getSourceListByOrg();
    var orgId = commonUtil.getParamFromURL('org_id');
    var fileName;
    if (typeof option != 'undefined' && option['fileName']) {
      fileName = option['fileName']
    }
    const sourceObj = sourceList.find((item) => {
      return item.name === sourceName;
    })
    var protocal = sourceObj.url.split('://')[0] === 'http' ? 'ws' : 'wss';
    var postUrl = `${protocal}://${sourceObj.url.split('://')[1]}${queryType}`;

    const socket = new WebSocket(postUrl);

    return socket;
  }

  simpleJsonSource.queryJson = function (sourceName, reqTargets, callback, option) {
    var sourceList = dataSourceUtil.getSourceListByOrg();
    const sourceObj = sourceList.find((item) => {
      return item.name === sourceName;
    })
    var curDate = new Date();
    var pastDate = new Date();
    var rangeObj = {};
    pastDate.setSeconds(curDate.getSeconds() - 300);

    // change variables
    for (var j = 0; j < reqTargets.length; j++) {
      if (reqTargets[j]["target"]) {
        if (typeof fileName != 'undefined') {
          reqTargets[j]["target"] = dataRefreshUtil.variableSrv.replaceWithTextByFileName(fileName, reqTargets[j]["target"]);
        } else {
          reqTargets[j]["target"] = dataRefreshUtil.variableSrv.replaceWithText(reqTargets[j]["target"]);
        }
      }
    }

    var jsonStr = {
      "range": {
        "from": pastDate,
        "to": curDate
      },
      "rangeRaw": {
        "from": "now-5m",
        "to": "now"
      },
      "maxDataPoints": 400,
      "interval": "1s",
      "intervalMs": 1000,
      'jsondata': sourceObj.json_data,
      "targets": reqTargets
    };
    if (dataRefreshUtil && dataRefreshUtil.timeRange) {
      if (typeof fileName != 'undefined') {
        rangeObj = dataRefreshUtil.timeRange.currentRangeByFileName(fileName);
      } else {
        rangeObj = dataRefreshUtil.timeRange.currentRange();
      }
      if (rangeObj) {
        jsonStr["range"] = rangeObj["range"];
        jsonStr["rangeRaw"] = rangeObj["rangeRaw"];
        jsonStr["interval"] = rangeObj["interval"];
        jsonStr["intervalMs"] = rangeObj["intervalMs"];
        jsonStr["maxDataPoints"] = rangeObj["maxDataPoints"];
      }
    }
    jsonStr['sourceList'] = sourceObj;
    jsonStr['org_id'] = parseInt(orgId);

    return jsonStr;
  }

  simpleJsonSource.wsSend = function (method, data) {
    if (simpleJsonSource.socket) {
      simpleJsonSource.socket.send(JSON.stringify({
        method: method,
        data: data
      }));
    }
  }


  simpleJsonSource.getValue = function (sourceName, reqTargets, callback, option) {
    var queryType = '/ws';
    // var proxyqueryType = '/ws';
    var sourceList = dataSourceUtil.getSourceListByOrg();
    var orgId = commonUtil.getParamFromURL('org_id');
    var fileName;
    if (typeof option != 'undefined' && option['fileName']) {
      fileName = option['fileName']
    }
    const sourceObj = sourceList.find((item) => {
      return item.name === sourceName;
    })
    var postUrl = sourceObj.url + queryType;
    if (!simpleJsonSource.socket) {
      simpleJsonSource.socket = simpleJsonSource.wsConnect(sourceName, reqTargets, callback, option)

      
      // 連接成功時觸發的事件
      simpleJsonSource.socket.onopen = function (event) {
        console.log('WebSocket連接成功');

        // 向伺服器端發送訊息
        // simpleJsonSource.socket.send('Hello, Server!');
        const queryJson = simpleJsonSource.queryJson(sourceName, reqTargets, callback, option)
        simpleJsonSource.wsSend('getValue', queryJson)
      };

      // 接收到伺服器端訊息時觸發的事件
      simpleJsonSource.socket.onmessage = function (event) {
        // console.log('接收到伺服器端訊息：', event.data);
        var resObjs = JSON.parse(event.data);
        if (resObjs.method === 'getValue') {
          if (Array.isArray(resObjs.data)) {
            const responseCallback = dataRefreshUtil.responseCallback(sourceObj.name)
            responseCallback(resObjs.data)
          }
        }
      };

      // 連線關閉時觸發的事件
      simpleJsonSource.socket.onclose = function (event) {
        console.log('WebSocket連線關閉');
        simpleJsonSource.socket = null;
      };

      // 連線錯誤時觸發的事件
      simpleJsonSource.socket.onerror = function (error) {
        console.error('WebSocket錯誤：', error);
        simpleJsonSource.socket = null;
      };
    }

    return true;
  }

  simpleJsonSource.setValue = function (sourceName, reqTargets, callback) {
    var sourceInfo = dataSourceUtil.getSourceInfo(sourceName);
    var EIToken = commonUtil.getCookie("EIToken");

    simpleJsonSource.wsSend('setValue', reqTargets)
    return true;

  };


  global.scPlugin.datasource["websocket-simple-json-datasource"] = simpleJsonSource;
})(this);