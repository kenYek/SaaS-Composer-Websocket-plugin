<template>
   <el-form label-position="left" inline class="data-source-form" v-if="scopeRow.expand">
      <el-form-item >
         <span class="title">HTTP</span>
      </el-form-item>
      <el-form-item label="URL" class="content">
         <span v-if="!scopeRow.isEdit">{{ scopeRow.url }}</span>
         <el-input v-if="scopeRow.isEdit" size="small" v-model="scopeRow.url"></el-input>
      </el-form-item>
      <el-form-item label="Access" class="content">
         <span v-if="!scopeRow.isEdit">{{ scopeRow.access }}</span>
         <el-select v-model="scopeRow.access" v-if="scopeRow.isEdit" :placeholder="$t('dataSource.chose')">
            <el-option
               v-for="item in accessOptions"
               :key="item.value"
               :label="item.label"
               :value="item.value">
            </el-option>
         </el-select>
      </el-form-item>
      <el-form-item label="websocketURL" class="content" v-if="scopeRow.access==='websocket'">
         <span v-if="!scopeRow.isEdit">{{ scopeRow.json_data.websocketurl }}</span>
         <el-input v-if="scopeRow.isEdit" size="small" v-model="scopeRow.json_data.websocketurl"></el-input>
      </el-form-item>
      <el-form-item>
         <span class="title">Auth</span>
      </el-form-item>
      <el-form-item>
         <el-checkbox label="Anonymous" :disabled="!scopeRow.isEdit" v-model="scopeRow.basic_auth" @change="scopeRow.with_credentials = false"></el-checkbox>
         <el-checkbox label="With Credentials" :disabled="!scopeRow.isEdit" v-model="scopeRow.with_credentials" @change="scopeRow.basic_auth = false"></el-checkbox>
      </el-form-item>
      <!-- <el-form-item>
         <el-checkbox label="Tls client Auth" :disabled="!scopeRow.isEdit"  v-model="scopeRow.json_data.tlsAuth"></el-checkbox>
         <el-checkbox label="With CA Cert" :disabled="!scopeRow.isEdit" v-model="scopeRow.json_data.tlsAuthWithCACert"></el-checkbox>
      </el-form-item>
      <el-form-item>
         <el-checkbox label="Skip TLS Verification(Insecure)" :disabled="!scopeRow.isEdit" v-model="scopeRow.json_data.tlsSkipVerify"></el-checkbox>
      </el-form-item> -->
      <el-form-item label="User" v-show="scopeRow.basic_auth">
         <el-input v-model="scopeRow.basic_auth_user"></el-input>
      </el-form-item>
      <el-form-item label="Password" v-show="scopeRow.basic_auth">
         <el-input v-model="scopeRow.basic_auth_password" show-password type="password"></el-input>
      </el-form-item>
      <el-form-item label="Client Cert" v-show="scopeRow.json_data.tlsAuth">
         <el-input type="textarea" :rows="3" class="secure_json_data_textarea" resize=none  v-model="scopeRow.secure_json_data.tlsClientCert"></el-input>
      </el-form-item>
      <el-form-item  label="Client key" v-show="scopeRow.json_data.tlsAuth">
         <el-input type="textarea"  :rows="3" class="secure_json_data_textarea" resize=none v-model="scopeRow.secure_json_data.tlsClientKey"></el-input>
      </el-form-item>
      <el-form-item  label="CA Cert" v-show="scopeRow.json_data.tlsAuthWithCACert">
         <el-input type="textarea" :rows="3" class="secure_json_data_textarea"  resize=none  v-model="scopeRow.secure_json_data.tlsCACert "></el-input>
      </el-form-item>
      <el-form-item>
         <span class="title">Advanced Http Setting</span>
      </el-form-item>
      <el-form-item label="Whitelisted Cookies" class="content">
         <span v-if="!scopeRow.isEdit">{{ scopeRow.json_data.keepCookies }}</span>
         <el-input v-if="scopeRow.isEdit" size="small" v-model="scopeRow.json_data.keepCookies"></el-input>
      </el-form-item>
      <el-row>
        <el-button icon="el-icon-refresh" @click="checkSourceConnection(scopeRow)"></el-button>
      </el-row>
   </el-form>
</template>

<script>
export default {
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
      }, {
        value: 'websocket',
        label: 'websocket'
      }
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
               console.log('connect success',this.response);
                  me.msgBox({message: me.langTrans('dataSource.message.connectSuccess'), type: 'success', duration: 2000});
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
</script>

<style>
.datasourceBlock {
  text-align: center;
  color: #2c3e50;
}
</style>
