<template>
  <base-nav
    v-model="showMenu"
    class="navbar-absolute top-navbar"
    type="white"
    :transparent="true"
  >
    <div slot="brand" class="navbar-wrapper">
      <div
        class="navbar-toggle d-inline"
        :class="{ toggled: $sidebar.showSidebar }"
      >
        <button type="button" class="navbar-toggler" @click="toggleSidebar">
          <span class="navbar-toggler-bar bar1"></span>
          <span class="navbar-toggler-bar bar2"></span>
          <span class="navbar-toggler-bar bar3"></span>
        </button>
      </div>
      <a class="navbar-brand ml-xl-3 ml-5" href="#pablo">{{ routeName }}</a>
    </div>

    <ul class="navbar-nav" :class="$rtl.isRTL ? 'mr-auto' : 'ml-auto'">

      <el-select class="select-success ml-xl-10" placeholder="Select device" @change= "selectDevice()" v-model= "selectedDevice">
        <el-option v-for= "device, index in $store.state.devices"  :value= "index" :label= "device.name" :key="device._id"></el-option>        
      </el-select>

      <div class="search-bar input-group" @click="searchModalVisible = true">
        <button
          class="btn btn-link"
          id="search-button"
          data-toggle="modal"
          data-target="#searchModal"
        >
          <i class="tim-icons icon-zoom-split"></i>
        </button>
        <!-- You can choose types of search input -->  
      </div>
      <modal
        :show.sync="searchModalVisible"
        class="modal-search"
        id="searchModal"
        :centered="false"
        :show-close="true"
      >
        <input
          slot="header"
          v-model="searchQuery"
          type="text"
          class="form-control"
          id="inlineFormInputGroup"
          placeholder="SEARCH"
        />
      </modal>
      <base-dropdown
        tag="li"
        :menu-on-right="!$rtl.isRTL"
        title-tag="a"
        title-classes="nav-link"
        class="nav-item"
      >
        <template
          slot="title"
        >
          <div v-if= "$store.state.notifications.length >0" class="notification d-none d-lg-block d-xl-block"></div>
          <i class="tim-icons icon-sound-wave"></i>
          <p class="d-lg-none">New Notifications</p>
        </template>

        <li @click="readedNotification(notification._id)" v-for = "notification in $store.state.notifications" class="nav-link" :key= "notification._id">
          <a href="#" class="nav-item dropdown-item">
            <b style = "color:orangered">{{unixToDate(notification.createdTime)}}</b>
            <div style = "margin-left:50px">
            <b>Device:</b> {{notification.deviceName}}<br>
            <b>Variable:</b>{{notification.variableFullName}}<br>
            <b>Value:</b>{{notification.payload.value}} <br>
            <b>Condition:</b>{{notification.condition}}<br>
            <b>Limit:</b>{{notification.value}} <br>
            </div>

           </a>
        </li>

      </base-dropdown>
      <base-dropdown
        tag="li"
        :menu-on-right="!$rtl.isRTL"
        title-tag="a"
        class="nav-item"
        title-classes="nav-link"
        menu-classes="dropdown-navbar"
      >
        <template
          slot="title"
        >
          <div class="photo"><img src="img/mike.jpg" /></div>
          <b class="caret d-none d-lg-block d-xl-block"></b>
          <p @click= "logout()" class="d-lg-none">Log out</p>
        </template>
        <li class="nav-link">
          <a href="#" class="nav-item dropdown-item">Profile</a>
        </li>
        <li class="nav-link">
          <a href="#" class="nav-item dropdown-item">Settings</a>
        </li>
        <div class="dropdown-divider"></div>
        <li class="nav-link">
          <a @click= "logout()" href="#" class="nav-item dropdown-item">Log out</a>
        </li>
      </base-dropdown>
    </ul>
  </base-nav>
</template>
<script>
import { CollapseTransition } from 'vue2-transitions';
import { BaseNav, Modal } from '@/components';
import { Select, Option } from 'element-ui';
export default {
  components: {
    CollapseTransition,
    BaseNav,
    Modal,
    [Option.name] : Option,
    [Select.name] : Select
  },
  computed: {
    routeName() {
      const { path } = this.$route;
      let parts = path.split('/')
      if(parts == ','){
        return 'Dashboard';
      }
      return parts.map(p => this.capitalizeFirstLetter(p)).join(' ');
    },
    isRTL() {
      return this.$rtl.isRTL;
    }
  },
  data() {
    return {
      activeNotifications: false,
      showMenu: false,
      searchModalVisible: false,
      searchQuery: '',
      selectedDevice: null
    };
  },
  mounted(){
    this.$store.dispatch("getDevices");
    this.$nuxt.$on('selectedDeviceIndex', this.updateSelectedDeviceIndex);

    },
  methods: {
    capitalizeFirstLetter(string) {
      if (!string || typeof string !== 'string') {
        return ''
      }
      return string.charAt(0).toUpperCase() + string.slice(1);
    },
    closeDropDown() {
      this.activeNotifications = false;
    },
    toggleSidebar() {
      this.$sidebar.displaySidebar(!this.$sidebar.showSidebar);
    },
    toggleMenu() {
      this.showMenu = !this.showMenu;
    },
    selectDevice(){
      const device = this.$store.state.devices[this.selectedDevice];
      const axiosHeader = {
        headers: {
        token: this.$store.state.auth.token
        }
      };
      const toSend ={
        dId: device.dId
      };
      this.$axios.put("/device", toSend, axiosHeader)
      .then(res=>{
      this.$store.dispatch("getDevices");      
      })
      .catch(e=>{
          console.log(e);
          return;
      });
    },
    updateSelectedDeviceIndex(index){
      console.log("update selected device index=>"+index);
      this.selectedDevice = index;
    },

    unixToDate(ms){
      var date= new Date(parseInt(ms)),
      yyyy = date.getFullYear(),
      mm = ('0'+(date.getMonth()+1)).slice(-2),
      dd = ('0'+date.getDate()).slice(-2),  
      hh = date.getHours(),
      h=hh,
      min = ('0'+date.getMinutes()).slice(-2),
      ampm = 'AM',
      time;
      if(hh>12){
        h=hh-12;
        ampm = 'PM';
      } else if (hh === 12){
        h=12;
        ampm='PM';
      }else if(hh === 0){
        h=12;
      }
      time = dd + '/' + mm + '/' + yyyy + '  ' + h + ':' + min + ' ' + ampm;
      return time; 
    },
    readedNotification(not){
      const axiosHeader = {
        headers: {
        token: this.$store.state.auth.token
        }
      };
      const toSend ={
        notId:not
      };
      this.$axios.put("/notifications", toSend, axiosHeader)
      .then(res=>{
      this.$store.dispatch("getNotifications");      
      })
      .catch(e=>{
          console.log(e);
          return;
      });
    },
    logout(){
      console.log("logout");
      //localStorage.removeItem("auth");
      localStorage.clear();
      const auth = {};
      this.$store.commit("setAuth", auth);
      window.location.href = "/login"
      }
  }
};
</script>
<style scoped>
.top-navbar {
  top: 0px;
}
</style>
