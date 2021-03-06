import {Api} from '../../utils/api.js';
const api = new Api();
const app = getApp();
import {Token} from '../../utils/token.js';
const token = new Token();


Page({
  data: {
    mainData:[],
    isFirstLoadAllStandard:['getMainData'],
  },

  onLoad(){
    const self = this;
    
  },

  onShow(){
    const self = this;
    api.commonInit(self);
    self.getMainData(true);
  },

  getMainData(isNew){
    const self = this;
    if(isNew){
      api.clearPageIndex(self);
    };
    const postData = {};
    postData.paginate = api.cloneForm(self.data.paginate);
    postData.tokenFuncName = 'getProjectToken';
    const callback = (res)=>{
      console.log(res);
      if(res.info.data.length>0){
        self.data.mainData.push.apply(self.data.mainData,res.info.data);
      }else{
        self.data.isLoadAll = true;
        api.showToast('没有更多了','fail');
      };
      api.checkLoadAll(self.data.isFirstLoadAllStandard,'getMainData',self);
      self.setData({
        web_mainData:self.data.mainData,
      });
    };
    api.addressGet(postData,callback);

  },
  

  choose(e){

    const self = this;
    const id = api.getDataSet(e,'id');
    self.data.id = id;
    getApp().globalData.address_id = id;
    self.setData({
      address_id:self.data.id,
    });
    setTimeout(function(){
      wx.navigateBack({
        delta: 1
      });
    },300);
    
  },


  intoPath(e){
    const self = this;
    api.buttonCanClick(self);
    api.pathTo(api.getDataSet(e,'path'),'nav',function(){
      api.buttonCanClick(self,true)
    });
  },



  deleteAddress(e){
    const self = this;
    api.buttonCanClick(self);
    const postData = {};
    postData.searchItem = {};
    postData.searchItem.id = api.getDataSet(e,'id');
    postData.tokenFuncName = 'getProjectToken';
    const callback = (res)=>{
      const resType = api.dealRes(res);
      if(resType){
        self.data.mainData=[];
        self.getMainData(true);
      };
      api.buttonCanClick(self,true)
    };
    api.addressDelete(postData,callback)
  },
  

  updateAddress(e){
    const self = this;
    api.buttonCanClick(self);
    const postData = {};
    postData.tokenFuncName = 'getProjectToken';
    postData.searchItem = {};
    postData.searchItem.id = api.getDataSet(e,'id');
    postData.data = {
      isdefault:1
    }
    const callback = (res) =>{
			 api.buttonCanClick(self,true);
      const resType = api.dealRes(res);
      if(resType){
        self.data.mainData=[];
        self.getMainData(true);
      };
     
    };
    api.addressUpdate(postData,callback);
  },

  
  onReachBottom() {
    const self = this;
    if(!self.data.isLoadAll&&self.data.buttonCanClick){
      self.data.paginate.currentPage++;
      self.getMainData();
    };
  },


})