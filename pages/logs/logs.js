import {Api} from '../../utils/api.js';
const api = new Api();
const app = getApp();
import {Token} from '../../utils/token.js';
const token = new Token();


Page({
  data: {



    mainData:[],
    products:[],
    totalPrice:0,
    isFirstLoadAllStandard:['getMainData']
  },
  
  onLoad() {
    const self = this;
    api.commonInit(self);
 
  },



  onShow() {
    const self = this;
    self.data.mainData = api.getStorageArray('cartData');
    console.log('onShow',self.data.mainData);
    self.checkChooseAll();
    self.setData({
      web_isChooseAll:self.data.isChooseAll,
      web_mainData:self.data.mainData
    });
    api.checkLoadAll(self.data.isFirstLoadAllStandard,'getMainData',self);
    self.countTotalPrice();

  },

  checkChooseAll(){
    const self = this;
    var isChooseAll = true;
    for (var i = 0; i < self.data.mainData.length; i++) {
      if(!self.data.mainData[i].isSelect){
        isChooseAll = false;
      };
    };
    self.data.isChooseAll = isChooseAll;
    self.setData({
      web_isChooseAll:self.data.isChooseAll
    });
  },

  chooseAll(){
    const self = this;
    self.data.isChooseAll = !self.data.isChooseAll;
    for (var i = 0; i < self.data.mainData.length; i++) {
      self.data.mainData[i].isSelect = self.data.isChooseAll;
      api.setStorageArray('cartData',self.data.mainData[i],'id',999);
    };
    self.setData({
      web_isChooseAll:self.data.isChooseAll,
      web_mainData:self.data.mainData
    });
    self.countTotalPrice();
  },

  delete(){
    const self = this;
    for(var i=0;i<self.data.mainData.length;i++){
      if(self.data.mainData[i].isSelect){
        api.delStorageArray('cartData',self.data.mainData[i],'id');
      }
    };
    self.data.mainData = api.getStorageArray('cartData');
    self.checkChooseAll();
    self.setData({
      web_mainData:self.data.mainData
    });
  },

  choose(e){
    const self = this;
    const index = api.getDataSet(e,'index');
    if(self.data.mainData[index].isSelect){
      self.data.mainData[index].isSelect = false;
    }else{
      self.data.mainData[index].isSelect = true;
    };
    api.setStorageArray('cartData',self.data.mainData[index],'id',999);
    self.setData({
      web_mainData:self.data.mainData
    });
    self.checkChooseAll();
    self.countTotalPrice();
  },

  countTotalPrice(){
    const self = this;
    var totalPrice = 0;
    var cartTotalCounts = 0;
    for(var i=0;i<self.data.mainData.length;i++){
      if(self.data.mainData[i].isSelect){
        totalPrice += self.data.mainData[i].price*self.data.mainData[i].count;
      };
    };
    self.setData({
      web_totalPrice:totalPrice.toFixed(2),
    })
  },



  pay(e){
    const self = this;
    api.buttonCanClick(self);
 
    const orderList = [{
			sku:[],
			type:1
			}
			
		];
    for(var i=0;i<self.data.mainData.length;i++){
      if(self.data.mainData[i].isSelect){
          orderList[0].sku.push(         
							{
								id:self.data.mainData[i].id,
								count:self.data.mainData[i].count
							},
          );
        };    
    };
		if (orderList[0].sku.length==0) {
			api.buttonCanClick(self, true);
			api.showToast('未选择商品', 'none', 1000);
			return;
		};
		wx.setStorageSync('payPro',orderList);
		api.pathTo('/pages/oder-true/oder-true','nav')
    
  },


  counter(e){
    const self = this;
    const index = api.getDataSet(e,'index');
    if(api.getDataSet(e,'type')=='+'){  
       self.data.mainData[index].count++;
    }else{
      if(self.data.mainData[index].count > 1){
        self.data.mainData[index].count--;
      }
    };
    api.setStorageArray('cartData',self.data.mainData[index],'id',999);
    self.setData({
      web_mainData:self.data.mainData
    });
    self.countTotalPrice();
  },


  bindManual(e) {
    const self = this;
    const index = api.getDataSet(e,'index');
    var num = e.detail.value;
    if(!num||num<1){
      num = 1;
    };
    self.data.mainData[index].count = num;
    api.setStorageArray('cartData',self.data.mainData[index],'id',999);
    self.setData({
      num: num,
      web_mainData:self.data.mainData
    });
    self.countTotalPrice();
  }, 



  intoPathRedirect(e){
    const self = this;
    api.pathTo(api.getDataSet(e,'path'),'redi');
  },


   
  
})

  

  