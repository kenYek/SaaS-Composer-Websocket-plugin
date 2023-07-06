
(function(funcName, baseObj) {
    // The public function name defaults to window.docReady
    // but you can pass in your own object and own function name and those will be used
    // if you want to put them in a different namespace
    funcName = funcName || "docReady";
    baseObj = baseObj || window;
    var readyList = [];
    var readyFired = false;
    var readyEventHandlersInstalled = false;

    // call this when the document is ready
    // this function protects itself against being called more than once
    function ready() {
        if (!readyFired) {
            // this must be set to true before we start calling callbacks
            readyFired = true;
            for (var i = 0; i < readyList.length; i++) {
                // if a callback here happens to add new ready handlers,
                // the docReady() function will see that it already fired
                // and will schedule the callback to run right after
                // this event loop finishes so all handlers will still execute
                // in order and no new ones will be added to the readyList
                // while we are processing the list
                readyList[i].fn.call(window, readyList[i].ctx);
            }
            // allow any closures held by these functions to free
            readyList = [];
        }
    }

    function readyStateChange() {
        if ( document.readyState === "complete" ) {
            ready();
        }
    }

    // This is the one public interface
    // docReady(fn, context);
    // the context argument is optional - if present, it will be passed
    // as an argument to the callback
    baseObj[funcName] = function(callback, context) {
        if (typeof callback !== "function") {
            throw new TypeError("callback for docReady(fn) must be a function");
        }
        // if ready has already fired, then just schedule the callback
        // to fire asynchronously, but right away
        if (readyFired) {
            setTimeout(function() {callback(context);}, 1);
            return;
        } else {
            // add the function and context to the list
            readyList.push({fn: callback, ctx: context});
        }
        // if document already ready to go, schedule the ready function to run
        if (document.readyState === "complete") {
            setTimeout(ready, 1);
        } else if (!readyEventHandlersInstalled) {
            // otherwise if we don't have event handlers installed, install them
            if (document.addEventListener) {
                // first choice is DOMContentLoaded event
                document.addEventListener("DOMContentLoaded", ready, false);
                // backup is window load event
                window.addEventListener("load", ready, false);
            } else {
                // must be IE
                document.attachEvent("onreadystatechange", readyStateChange);
                window.attachEvent("onload", ready);
            }
            readyEventHandlersInstalled = true;
        }
    }
})("docReady", window);
var compWebsocketSimpleJsonDatasource={
    template:`<el-form label-position="left" inline="" class="data-source-form" v-if="scopeRow.expand" data-v-560f41ff="">
   <el-form-item data-v-560f41ff="">
      <span class="title" data-v-560f41ff="">HTTP</span>
   </el-form-item>
   <el-form-item label="URL" class="content" data-v-560f41ff="">
      <span v-if="!scopeRow.isEdit" data-v-560f41ff="">{{ scopeRow.url }}</span>
      <el-input v-if="scopeRow.isEdit" size="small" v-model="scopeRow.url" data-v-560f41ff=""></el-input>
   </el-form-item>
   <el-form-item label="Access" class="content" data-v-560f41ff="">
      <span v-if="!scopeRow.isEdit" data-v-560f41ff="">{{ scopeRow.access }}</span>
      <el-select v-model="scopeRow.access" v-if="scopeRow.isEdit" :placeholder="$t('dataSource.chose')" data-v-560f41ff="">
         <el-option v-for="item in accessOptions" :key="item.value" :label="item.label" :value="item.value" data-v-560f41ff="">
         </el-option>
      </el-select>
   </el-form-item>
   <el-form-item label="websocketURL" class="content" v-if="scopeRow.access==='websocket'" data-v-560f41ff="">
      <span v-if="!scopeRow.isEdit" data-v-560f41ff="">{{ scopeRow.json_data.websocketurl }}</span>
      <el-input v-if="scopeRow.isEdit" size="small" v-model="scopeRow.json_data.websocketurl" data-v-560f41ff=""></el-input>
   </el-form-item>
   <el-form-item data-v-560f41ff="">
      <span class="title" data-v-560f41ff="">Auth</span>
   </el-form-item>
   <el-form-item data-v-560f41ff="">
      <el-checkbox label="Anonymous" :disabled="!scopeRow.isEdit" v-model="scopeRow.basic_auth" @change="scopeRow.with_credentials = false" data-v-560f41ff=""></el-checkbox>
      <el-checkbox label="With Credentials" :disabled="!scopeRow.isEdit" v-model="scopeRow.with_credentials" @change="scopeRow.basic_auth = false" data-v-560f41ff=""></el-checkbox>
   </el-form-item>
   <!-- <el-form-item>
      <el-checkbox label="Tls client Auth" :disabled="!scopeRow.isEdit"  v-model="scopeRow.json_data.tlsAuth"></el-checkbox>
      <el-checkbox label="With CA Cert" :disabled="!scopeRow.isEdit" v-model="scopeRow.json_data.tlsAuthWithCACert"></el-checkbox>
   </el-form-item>
   <el-form-item>
      <el-checkbox label="Skip TLS Verification(Insecure)" :disabled="!scopeRow.isEdit" v-model="scopeRow.json_data.tlsSkipVerify"></el-checkbox>
   </el-form-item> -->
   <el-form-item label="User" v-show="scopeRow.basic_auth" data-v-560f41ff="">
      <el-input v-model="scopeRow.basic_auth_user" data-v-560f41ff=""></el-input>
   </el-form-item>
   <el-form-item label="Password" v-show="scopeRow.basic_auth" data-v-560f41ff="">
      <el-input v-model="scopeRow.basic_auth_password" show-password="" type="password" data-v-560f41ff=""></el-input>
   </el-form-item>
   <el-form-item label="Client Cert" v-show="scopeRow.json_data.tlsAuth" data-v-560f41ff="">
      <el-input type="textarea" :rows="3" class="secure_json_data_textarea" resize="none" v-model="scopeRow.secure_json_data.tlsClientCert" data-v-560f41ff=""></el-input>
   </el-form-item>
   <el-form-item label="Client key" v-show="scopeRow.json_data.tlsAuth" data-v-560f41ff="">
      <el-input type="textarea" :rows="3" class="secure_json_data_textarea" resize="none" v-model="scopeRow.secure_json_data.tlsClientKey" data-v-560f41ff=""></el-input>
   </el-form-item>
   <el-form-item label="CA Cert" v-show="scopeRow.json_data.tlsAuthWithCACert" data-v-560f41ff="">
      <el-input type="textarea" :rows="3" class="secure_json_data_textarea" resize="none" v-model="scopeRow.secure_json_data.tlsCACert " data-v-560f41ff=""></el-input>
   </el-form-item>
   <el-form-item data-v-560f41ff="">
      <span class="title" data-v-560f41ff="">Advanced Http Setting</span>
   </el-form-item>
   <el-form-item label="Whitelisted Cookies" class="content" data-v-560f41ff="">
      <span v-if="!scopeRow.isEdit" data-v-560f41ff="">{{ scopeRow.json_data.keepCookies }}</span>
      <el-input v-if="scopeRow.isEdit" size="small" v-model="scopeRow.json_data.keepCookies" data-v-560f41ff=""></el-input>
   </el-form-item>
   <el-row data-v-560f41ff="">
     <el-button icon="el-icon-refresh" @click="checkSourceConnection(scopeRow)" data-v-560f41ff=""></el-button>
   </el-row>
</el-form>`,
  name: "compWebsocketSimpleJsonDatasource",
  props: {
      langTrans: {
         type: Function
      },
      msgBox: {
         type: Function
      },
      row: {
        type: Object
      }
  },
  data() {
    return {
      scopeRow: this.row,
      accessOptions: [{
        value: 'proxy',
        label: 'proxy'
      }, {
        value: 'direct',
        label: 'direct'
      }
      // , {
      //   value: 'websocket',
      //   label: 'websocket'
      // }
      ]
    }
  },
  watch:{
    //   scopeRow (val){
    //       this.$emit('sync-row-data', val)
    //   }
  },
  methods: {
    handleClick(row) {
      console.log(row);
    },
    updateQueryStringParam(urlPath, key, value) {
      var baseUrl = '', urlQueryString = '';
      if(urlPath.indexOf('?') < 0){
            baseUrl = urlPath;
      } else {
            baseUrl = urlPath.substring(0, urlPath.indexOf('?'));
            urlQueryString = urlPath.substring(urlPath.indexOf('?'));
      }
      var newParam = key + '=' + value,
            params = '?' + newParam;
      // If the "search" string exists, then build params from it
      if (urlQueryString) {
            updateRegex = new RegExp('([\?&])' + key + '[^&]*');
            removeRegex = new RegExp('([\?&])' + key + '=[^&;]+[&;]?');
            if( typeof value == 'undefined' || value == null || value == '' ) { // Remove param if value is empty
               params = urlQueryString.replace(removeRegex, "$1");
               params = params.replace( /[&;]$/, "" );
            } else if (urlQueryString.match(updateRegex) !== null) { // If param exists already, update it
               params = urlQueryString.replace(updateRegex, "$1" + newParam);
            } else { // Otherwise, add it to end of query string
               params = urlQueryString + '&' + newParam;
            }
      }
      return baseUrl + params;
    },
    checkSourceConnection(row) {
       var me = this;
       var orgId = parseInt(this.$route.params.orgId);
      if(row && !row.url) {
         return false;
      }
      if(row && row.access == 'proxy') {
        var localhostUrl  = window.location.origin;
        var proxyqueryType = '/api/datasource/proxy/connect';
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
               respData = JSON.parse(this.response);
              if(respData && respData.errCode == 0){
                  console.log('connect success',this.response);
                  me.msgBox({message: me.langTrans('dataSource.message.connectSuccess'), type: 'success', duration: 2000});
              } else {
                  me.msgBox({message: me.langTrans('dataSource.message.connectFail'), type: 'error', duration: 2000});
              }
               // Typical action to be performed when the document is ready:
               // document.getElementById("demo").innerHTML = xhttp.responseText;
            } else {
            }
        };
        xhttp.open("POST", localhostUrl + proxyqueryType, true);
        xhttp.setRequestHeader('Content-type', 'application/json; charset=UTF-8');
        xhttp.send(JSON.stringify({'url': row.url, 'org_id':orgId}));
      } else {
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4) {
               if(this.status == 200){
                  // console.log('connect success');
                  me.msgBox({message: me.langTrans('dataSource.message.connectSuccess'), type: 'success', duration: 2000});
                  // Typical action to be performed when the document is ready:
                  // document.getElementById("demo").innerHTML = xhttp.responseText;
               } else {
                  me.msgBox({message: me.langTrans('dataSource.message.connectFail'), type: 'error', duration: 2000});
               }
            } else {
            }
        };
        var url = me.updateQueryStringParam(row.url, 'org_id', orgId);
        xhttp.open("GET", url, true);
        xhttp.send();
      }
    },
    dataValidation(row) {
       var me = this;
       if (row.basic_auth) {
        if (row.basic_auth_user === '') {
          me.msgBox({message: this.$t('dataSource.message.emptyUser'), type: 'warning', duration: 2000})
          return false;
        }
        if (row.basic_auth_password === '') {
          me.msgBox({message: this.$t('dataSource.message.emptyPassword'), type: 'warning', duration: 2000})
          return false;
        }
      }
      return true;
    }
  }
}
;

docReady(function(){
    var css = `.datasourceBlock {
  text-align: center;
  color: #2c3e50;}
`;
    var head = document.getElementsByTagName('head')[0];
    var style = document.createElement('style');
    style.type = 'text/css';
    if(style.styleSheet){
        style.styleSheet.cssText = css;
    }else{
        style.appendChild(document.createTextNode(css));
    }
    head.appendChild(style);
});
