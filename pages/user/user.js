import {
	Api
} from '../../utils/api.js';
var api = new Api();
const app = getApp();
import {
	Token
} from '../../utils/token.js';
const token = new Token();

Page({
	data: {

		mainData: [],
		searchItem: {},
		isFirstLoadAllStandard: ['getMainData'],
	},


	onLoad() {
		const self = this;
		api.commonInit(self);
	
	},
	
	onShow(){
		const self = this;
		self.getMainData()
	},
	
	getMainData(){
		const self = this;
		const postData = {};
		postData.tokenFuncName = 'getProjectToken';
		const callback = (res)=>{
		  if(res.solely_code==100000){
		    self.data.mainData = res.info.data[0]
		  }else{
		    api.showToast('网络故障','none')
		  }
		  api.checkLoadAll(self.data.isFirstLoadAllStandard,'getMainData',self);
		  self.setData({
		    web_mainData:self.data.mainData,
		  });  
		};
		api.userGet(postData,callback)
	},



	intoPath(e) {
		const self = this;
		api.pathTo(api.getDataSet(e, 'path'), 'nav');
	},

	intoPathRedirect(e) {
		const self = this;
		api.pathTo(api.getDataSet(e, 'path'), 'redi');
	},
})
